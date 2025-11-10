import {
    splitListOfDocs,
} from "langchain/chains/combine_documents/reduce";
import { Document } from "@langchain/core/documents";
import { StateGraph, Annotation, Send } from "@langchain/langgraph";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { ChatGroq } from "@langchain/groq";
import { ChatOpenAI } from "@langchain/openai";
import "dotenv/config"
import Groq from "groq-sdk";
const loader = new CheerioWebBaseLoader('https://lilianweng.github.io/posts/2023-03-15-prompt-engineering');
const docs = await loader.load();
const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,     // Reduced from 1000
    chunkOverlap: 100,  // Reduced from 200
});
const allSplitDocs = await textSplitter.splitDocuments(docs);
// Limit to first 10 documents to reduce API calls
const splitDocs = allSplitDocs.slice(0, 7);  // Reduced to 5 to stay under 4096 token limit

// Option 1: OpenAI (Recommended - Higher rate limits)
// const llm = new ChatOpenAI({
//     model: 'minimax/minimax-m2:free',
//     apiKey: "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",
//     configuration: {
//         baseURL: "https://openrouter.ai/api/v1",
//     },
//     temperature: 0.7,
// });

// const llmCollapseSummary = new ChatOpenAI({
//     model: 'minimax/minimax-m2:free',
//     apiKey: "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",
//     configuration: {
//         baseURL: "https://openrouter.ai/api/v1",
//     },
//     temperature: 0.7,
// });

// Option 2: Groq (Daily limit reached - wait 13 minutes)
const llm = new ChatGroq({
    model: 'openai/gpt-oss-120b',
    apiKey: process.env.GROQ_API_KEY,
    temperature: 0.7,
    
})

const llmCollapseSummary = new ChatGroq({
    model: 'moonshotai/kimi-k2-instruct-0905',
    apiKey: process.env.GROQ_API_KEY,
    temperature: 0.7,
    
})
// https://fireworks.ai/
// const llm = new ChatFireworks({
// model: "accounts/fireworks/models/deepseek-v3p1",
// temperature: 0.7,
// apiKey: process.env. FIRE_WORKS_API_KEY,
// });
let tokenMax = 2000;  // Balanced to avoid infinite loops and stay within limits

function approximateTokens(text: string): number {
    // Roughly: 1 token = 4 characters (English text)
    return Math.ceil(text.length / 4);

}

async function lengthFunction(documents: Document[]) {
    const tokenCounts = documents.map(doc => approximateTokens(doc.pageContent));
    return tokenCounts.reduce((sum, count) => sum + count, 0);

}

const OverallState = Annotation.Root({
    contents: Annotation<string[]>,
    // Notice here we pass a reducer function.
    // This is because we want combine all the briefings we generate
    // from individual nodes back into one list - this is essentially
    // the "reduce" part
    briefings: Annotation<string[]>({
        reducer: (state, update) => state.concat(update),
    }),
    collapsedBriefings: Annotation<Document[]>,
    finalBriefing: Annotation<string>,
});

// This will be the state of the node that we will "map" all
// documents to in order to generate briefings
interface BriefingChunkState {
    content: string;
}
// Here we generate a briefing, given a document
const generateBriefingChunk = async (
    state: BriefingChunkState
): Promise<{ briefings: string[] }> => {
    const mapPrompt = ChatPromptTemplate.fromMessages([
        [
            "user",
                      `Create a professional briefing document for the following text.
Include:
- Summary of main ideas
- Key takeaways
- Actionable insights or recommendations
Format as concise, clear paragraphs: \n\n{context}` ,



        ],
    ]);
    const prompt = await mapPrompt.invoke({ context: state.content });
    const response = await llm.invoke(prompt);
    return { briefings: [String(response.content)] };
}

// Here we define the logic to map out over the documents
// We will use this an edge in the graph
const mapBriefings = (state: typeof OverallState.State) => {
    // We will return a list of `Send` objects
    // Each `Send` object consists of the name of a node in the graph
    // as well as the state to send to that node
    return state.contents.map(
        (content) => new Send("generateBriefingChunk", { content })
    );
};
const collectBriefings = async (state: typeof OverallState.State) => {
    return {
        collapsedBriefings: state.briefings.map(
            (briefing: string) => new Document({ pageContent: briefing })
        ),
    };
};
// Here we collapse a list of documents into a single document
async function collapseDocs(docList: Document<Record<string, any>>[], _reduce: (input: any) => Promise<string>): Promise<Document> {
    const combinedContent = docList.map(doc => doc.pageContent).join("\n\n");
    const summary = await _reduce(combinedContent);
    return new Document({ pageContent: summary });
}
async function _reduce(input: any): Promise<string> {

    const reducePrompt = ChatPromptTemplate.fromMessages([
        ["user",

            `The following are briefing document chunks:
{docs}

Distill these into a single cohesive briefing document.
Maintain main ideas, key takeaways, and actionable insights.`,

        ],
    

    ]);
    const prompt = await reducePrompt.invoke({ docs: input });
    const response = await llmCollapseSummary.invoke(prompt);
    return String(response.content);
}

const collapseBriefings = async (state: typeof OverallState.State) => {
    const docLists = splitListOfDocs(
        state.collapsedBriefings,
        lengthFunction,
        tokenMax

    );
    const results = [];
    for (const docList of docLists) {
        results.push(await collapseDocs(docList, _reduce));
    }
    return { collapsedBriefings: results };
};

// This represents a conditional edge in the graph that determines
// if we should collapse the briefings or not
async function shouldCollapse(state: typeof OverallState.State) {
    let numTokens = await lengthFunction(state.collapsedBriefings);
    if (numTokens > tokenMax) {
        return "collapseBriefings";
    } else {
        return "generateFinalBriefing";
    }
}

// Here we will generate the final briefing
const generateFinalBriefing = async (state: typeof OverallState.State) => {
    const response = await _reduce(state.collapsedBriefings);
    return { finalBriefing: response };

};

// Construct the graph
const graph = new StateGraph(OverallState)
    .addNode("generateBriefingChunk", generateBriefingChunk)
    .addNode("collectBriefings", collectBriefings)
    .addNode("collapseBriefings", collapseBriefings)
    .addNode("generateFinalBriefing", generateFinalBriefing)
    .addConditionalEdges("__start__", mapBriefings, ["generateBriefingChunk"])
    .addEdge("generateBriefingChunk", "collectBriefings")
    .addConditionalEdges("collectBriefings", shouldCollapse, [
        "collapseBriefings",
        "generateFinalBriefing",
    ])
    .addConditionalEdges("collapseBriefings", shouldCollapse, [
        "collapseBriefings",
        "generateFinalBriefing",
    ])
    .addEdge("generateFinalBriefing", "__end__");

const app = graph.compile();

// const finalSummary = await app.invoke(
//     {
//         contents: splitDocs.map((doc) => doc.pageContent),
//     },
//     {
//         recursionLimit: 10,
//     }
// )

let finalBriefing = null;

for await (const step of await app.stream(
    { contents: splitDocs.map((doc) => doc.pageContent) },
    { recursionLimit: 10 }  // Increased from 5
)) {
    console.log(Object.keys(step));
    if (step.hasOwnProperty("generateFinalBriefing")) {
        finalBriefing = step.generateFinalBriefing;
    }
}

console.log('Final briefing document : ', finalBriefing)

