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
import { Runnable } from "@langchain/core/runnables";
// const loader = new CheerioWebBaseLoader('https://lilianweng.github.io/posts/2023-03-15-prompt-engineering');
// const docs = await loader.load();
// const textSplitter = new RecursiveCharacterTextSplitter({
//     chunkSize: 500,     // Reduced from 1000
//     chunkOverlap: 100,  // Reduced from 200
// });
// const allSplitDocs = await textSplitter.splitDocuments(docs);
// Limit to first 10 documents to reduce API calls
// const splitDocs = allSplitDocs.slice(0, 7);  // Reduced to 5 to stay under 4096 token limit

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


export async function generateFAQ<T extends Runnable>(llm: T, splitDocs: Document[]) {


// const llm = new ChatGroq({
//     model: 'openai/gpt-oss-120b',
//     apiKey: process.env.GROQ_API_KEY,
//     temperature: 0.7,
    
// })

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
let tokenMax = 1000;  // Balanced to avoid infinite loops and stay within limits

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
    // This is because we want combine all the FAQs we generate
    // from individual nodes back into one list - this is essentially
    // the "reduce" part
    faqs: Annotation<string[]>({
        reducer: (state, update) => state.concat(update),
    }),
    collapsedFaqs: Annotation<Document[]>,
    finalFaq: Annotation<string>,
});

// This will be the state of the node that we will "map" all
// documents to in order to generate FAQs
interface FaqChunkState {
    content: string;
}
// Here we generate a FAQ, given a document
const generateFaqChunk = async (
    state: FaqChunkState
): Promise<{ faqs: string[] }> => {
    const mapPrompt = ChatPromptTemplate.fromMessages([
        [
            "user",
                      `Create a set of FAQs (questions and answers) from the following text.
Each FAQ should include:
- A clear question
- A concise, accurate answer
Format as a list of Q&A:\n\n{context}` ,



        ],
    ]);
    const prompt = await mapPrompt.invoke({ context: state.content });
    const response = await llm.invoke(prompt);
    return { faqs: [String(response.content)] };
}

// Here we define the logic to map out over the documents
// We will use this an edge in the graph
const mapFaqs = (state: typeof OverallState.State) => {
    // We will return a list of `Send` objects
    // Each `Send` object consists of the name of a node in the graph
    // as well as the state to send to that node
    return state.contents.map(
        (content) => new Send("generateFaqChunk", { content })
    );
};
const collectFaqs = async (state: typeof OverallState.State) => {
    return {
        collapsedFaqs: state.faqs.map(
            (faq: string) => new Document({ pageContent: faq })
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

            `The following are FAQs (questions and answers) chunks:
{docs}

Distill these into a single cohesive FAQ document.
Maintain main ideas, key takeaways, and actionable insights.`,

        ],
    

    ]);
    const prompt = await reducePrompt.invoke({ docs: input });
    const response = await llmCollapseSummary.invoke(prompt);
    return String(response.content);
}

const collapseFaqs = async (state: typeof OverallState.State) => {
    const docLists = splitListOfDocs(
        state.collapsedFaqs,
        lengthFunction,
        tokenMax

    );
    const results = [];
    for (const docList of docLists) {
        results.push(await collapseDocs(docList, _reduce));
    }
    return { collapsedFaqs: results };
};

// This represents a conditional edge in the graph that determines
// if we should collapse the FAQs or not
async function shouldCollapse(state: typeof OverallState.State) {
    let numTokens = await lengthFunction(state.collapsedFaqs);
    if (numTokens > tokenMax) {
        return "collapseFaqs";
    } else {
        return "generateFinalFaq";
    }
}

// Here we will generate the final FAQ
const generateFinalFaq = async (state: typeof OverallState.State) => {
    const response = await _reduce(state.collapsedFaqs);
    return { finalFaq: response };

};

// Construct the graph
const graph = new StateGraph(OverallState)
    .addNode("generateFaqChunk", generateFaqChunk)
    .addNode("collectFaqs", collectFaqs)
    .addNode("collapseFaqs", collapseFaqs)
    .addNode("generateFinalFaq", generateFinalFaq)
    .addConditionalEdges("__start__", mapFaqs, ["generateFaqChunk"])
    .addEdge("generateFaqChunk", "collectFaqs")
    .addConditionalEdges("collectFaqs", shouldCollapse, [
        "collapseFaqs",
        "generateFinalFaq",
    ])
    .addConditionalEdges("collapseFaqs", shouldCollapse, [
        "collapseFaqs",
        "generateFinalFaq",
    ])
    .addEdge("generateFinalFaq", "__end__");

const app = graph.compile();

// const finalSummary = await app.invoke(
//     {
//         contents: splitDocs.map((doc) => doc.pageContent),
//     },
//     {
//         recursionLimit: 10,
//     }
// )

let finalFAQ = null;

for await (const step of await app.stream(
    { contents: splitDocs.map((doc) => doc.pageContent) },
    { recursionLimit: 10 }  // Increased from 5
)) {
    console.log(Object.keys(step));
    if (step.hasOwnProperty("generateFinalFaq")) {
        finalFAQ = step.generateFinalFaq;
    }
}

// console.log('Final FAQ document : ', finalFAQ)
return finalFAQ;
}