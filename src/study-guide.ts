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
    model: 'moonshotai/kimi-k2-instruct',
    apiKey: process.env.GROQ_API_KEY,
    temperature: 0.7,
    
})

const llmCollapseSummary = new ChatGroq({
    model: 'moonshotai/kimi-k2-instruct',
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
    // This is because we want combine all the summaries we generate
    // from individual nodes back into one list - this is essentially
    // the "reduce" part
    studyGuides: Annotation<string[]>({
        reducer: (state, update) => state.concat(update),
    }),
    collapsedSummaries: Annotation<Document[]>,
    finalSummary: Annotation<string>,
});

// This will be the state of the node that we will "map" all
// documents to in order to generate summaries
interface StudyGuideChunkState {
    content: string;
}
// Here we generate a summary, given a document
const generateStudyGuideChunk = async (
    state: StudyGuideChunkState
): Promise<{ studyGuides: string[] }> => {
    const mapPrompt = ChatPromptTemplate.fromMessages([
        [
            "user",
                      `Create structured study notes for the following text. Include:
- Key concepts / definitions
- Examples or illustrations
- Important points
Format as bullet points: \n\n{context}`,



        ],
    ]);
    const prompt = await mapPrompt.invoke({ context: state.content });
    const response = await llm.invoke(prompt);
    return { studyGuides: [String(response.content)] };
}

// Here we define the logic to map out over the documents
// We will use this an edge in the graph
const mapStudyGuides = (state: typeof OverallState.State) => {
    // We will return a list of `Send` objects
    // Each `Send` object consists of the name of a node in the graph
    // as well as the state to send to that node
    return state.contents.map(
        (content) => new Send("generateStudyGuideChunk", { content })
    );
};
const collectStudyGuides = async (state: typeof OverallState.State) => {
    return {
        collapsedSummaries: state.studyGuides.map(
            (summary) => new Document({ pageContent: summary })
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

            `The following are study guide chunks:
{docs}

Distill these into a single cohesive study guide.
Maintain key concepts, examples, and main points.`,

        ],
    

    ]);
    const prompt = await reducePrompt.invoke({ docs: input });
    const response = await llmCollapseSummary.invoke(prompt);
    return String(response.content);
}

const collapseStudyGuides = async (state: typeof OverallState.State) => {
    const docLists = splitListOfDocs(
        state.collapsedSummaries,
        lengthFunction,
        tokenMax

    );
    const results = [];
    for (const docList of docLists) {
        results.push(await collapseDocs(docList, _reduce));
    }
    return { collapsedSummaries: results };
};

// This represents a conditional edge in the graph that determines
// if we should collapse the summaries or not
async function shouldCollapse(state: typeof OverallState.State) {
    let numTokens = await lengthFunction(state.collapsedSummaries);
    if (numTokens > tokenMax) {
        return "collapseStudyGuides";
    } else {
        return "generateFinalStudyGuide";
    }
}

// Here we will generate the final summary
const generateFinalStudyGuide = async (state: typeof OverallState.State) => {
    const response = await _reduce(state.collapsedSummaries);
    return { finalSummary: response };

};

// Construct the graph
const graph = new StateGraph(OverallState)
    .addNode("generateStudyGuideChunk", generateStudyGuideChunk)
    .addNode("collectStudyGuides", collectStudyGuides)
    .addNode("collapseStudyGuides", collapseStudyGuides)
    .addNode("generateFinalStudyGuide", generateFinalStudyGuide)
    .addConditionalEdges("__start__", mapStudyGuides, ["generateStudyGuideChunk"])
    .addEdge("generateStudyGuideChunk", "collectStudyGuides")
    .addConditionalEdges("collectStudyGuides", shouldCollapse, [
        "collapseStudyGuides",
        "generateFinalStudyGuide",
    ])
    .addConditionalEdges("collapseStudyGuides", shouldCollapse, [
        "collapseStudyGuides",
        "generateFinalStudyGuide",
    ])
    .addEdge("generateFinalStudyGuide", "__end__");

const app = graph.compile();

// const finalSummary = await app.invoke(
//     {
//         contents: splitDocs.map((doc) => doc.pageContent),
//     },
//     {
//         recursionLimit: 10,
//     }
// )

let finalStudyGuide = null;

for await (const step of await app.stream(
    { contents: splitDocs.map((doc) => doc.pageContent) },
    { recursionLimit: 10 }  // Increased from 5
)) {
    console.log(Object.keys(step));
    if (step.hasOwnProperty("generateFinalStudyGuide")) {
        finalStudyGuide = step.generateFinalStudyGuide;
    }
}

console.log('Final study guide : ', finalStudyGuide)

