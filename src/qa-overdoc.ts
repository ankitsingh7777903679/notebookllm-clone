import { END, START, StateGraph, Annotation } from "@langchain/langgraph";
// [nextNode, retrievedDoc, filteredDoc, transformQuery]
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers"
import { ChatOpenAI } from "@langchain/openai";
import { ChatMessagePromptTemplate, ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts"
import { DocumentInterface } from "@langchain/core/documents";
import dotenv from "dotenv";
import { ChatGroq } from "@langchain/groq";
import Groq from "groq-sdk";
import { Document } from "@langchain/core/documents";
import z from "zod";
// import { formatDocumentsAsString } from "langchain/util/document";
import { formatDocumentsAsString } from "langchain/util/document";
dotenv.config();

import zodToJsonSchema from "zod-to-json-schema";
import { queryVectorDB } from "./retriever";
import { parse } from "path";
import { reciprocalRankFusion } from "./RRF";
import { extrectMessage, gradeDocResponseFormater, questionResponseFormater, TranformResponseFormatter } from "./util";
import { generate_question_prompt, grade_doc_prompt, response_generator_prompt, transform_query_prompt } from "./prompt/prompts";
import { TavilySearch } from "@langchain/tavily";
dotenv.config();
const llm = new ChatGroq({
    model: 'openai/gpt-oss-120b',
    apiKey: process.env.GROQ_API_KEY,
})
// const llm = new ChatOpenAI({
//     model: 'gpt-5-mini',
//     configuration: {
//         apiKey: process.env.OPENAI_API_KEY,
//         baseURL: process.env.OPENAI_API_BASE_URL,


//     }
// })
const StateAnnotation = Annotation.Root({
    // 1. It allows to know on which node we are
    // 2. we can use a state to know value inside of it
    currentNode: Annotation<string>({
        default: () => "",
        reducer: (previousVal, nextVal) => previousVal ? previousVal : nextVal
    })
    ,
    nextNode: Annotation<string>({
        default: () => "",
        reducer: (previousVal, nextVal) => previousVal ? previousVal : nextVal
    }),
    users: Annotation<string[]>({
        default: () => [],
        reducer: (previousVal, nextVal) => {

            return previousVal.concat(nextVal)
        }

    }),

    aggregate: Annotation<string[]>({
        reducer: (x, y) => x.concat(y),
    }),

    messages: Annotation<(HumanMessage | AIMessage | SystemMessage)[]>({
        default: () => [],
        reducer: (previousVal, nextVal) => previousVal.concat(nextVal)
    }),

    retrivedDoc: Annotation<Document[]>({
        default: () => [],
        reducer: (previousVal, nextVal) => previousVal.length > 0 ? previousVal : nextVal
    }),

    filteredDoc: Annotation<Document[]>({
        default: () => [],
        reducer: (previousVal, nextVal) => previousVal.length > 0 ? previousVal : nextVal
    }),

    newQuery: Annotation<string>({
        default: () => "",
        reducer: (previousVal, nextVal) => previousVal ? previousVal : nextVal
    }),

    generateQuestion: Annotation<string[]>({
        default: () => [],
        reducer: (previousVal, nextVal) => previousVal.length > 0 ? previousVal : nextVal
    })
});

// - node[retriever: [retriever, question-gen, fused
// Create the graph
const RetrieverNode = async (state: typeof StateAnnotation.State) => {
    console.log("start RetrieverNode...")

    const lastMessage = extrectMessage(state, 'human');
    const query = lastMessage.content;

    const generateQuestionPrompt = await generate_question_prompt.invoke({
        question: query,

    })

    // const structuredLlm = llm.withStructuredOutput(
    //     z.object({
    //         questions: z.array(z.string()).describe("Array of 5 diverse search queries"),
    //     })
    // );

    // const llmResult = await structuredLlm.invoke([
    //     {
    //         role: "user",
    //         content: generateQuestionPrompt.value
    //     }
    // ])
    const llmResult = await llm.invoke([

        {
            role: "user",
            content: generateQuestionPrompt.value + "\n\nProvide your response in JSON format."
        }
    ], questionResponseFormater)
    // console.log("Generated Questions LLM Result:", llmResult);
    const parsedResult = JSON.parse(llmResult?.content as string)
    const questions = (parsedResult?.questions || parsedResult?.search_queries || parsedResult?.queries || parsedResult?.diverse_search_queries) as string[]
    // console.log("Extracted Questions:", questions);
    // const questions = llmResult.questions;
    const allRetrivedDocs = [] as Document[][];
    for (const question of questions) {
        const result = await queryVectorDB(question);
        allRetrivedDocs.push(result);
    }
    const fusedDoc = reciprocalRankFusion(allRetrivedDocs); // Take top 10 documents

    console.log("RetrieverNode...")
    return {
        retrivedDoc: fusedDoc
    }

};
// Create the graph
const gradeDocNode = async (state: typeof StateAnnotation.State) => {
    const lastMessage = extrectMessage(state, 'human');
    const allRetrivedDoc = state.retrivedDoc;
    const allFilteredDoc = [] as Document[];

    const chain = grade_doc_prompt.pipe(llm)
    for (const doc of allRetrivedDoc) {
        const chainResult = await chain.invoke({
            question: lastMessage?.content + "\n\nProvide your response in JSON format.",
            context: doc?.pageContent,

        }, gradeDocResponseFormater as any)

        const parsedResult = JSON.parse(chainResult?.content as string) as 'yes' | 'no'

        if (parsedResult === 'yes') {
            allFilteredDoc.push(new Document({ pageContent: doc?.pageContent }));
        } else {

        }
    }

    console.log("gradeDocNode...")
    return {
        filteredDoc: allFilteredDoc
    };
};

const transformQuery = async (state: typeof StateAnnotation.State) => {
    const lastMessage = extrectMessage(state, 'human');

    console.log(" --- TRANSFORM QUERY --- ");

    // Prompt
    const chain = transform_query_prompt.pipe(llm)
    // .pipe(new StringOutputParser());
    const betterQuestionResult = await chain.invoke({ question: lastMessage?.content + "\n\nProvide your response in JSON format." },
        TranformResponseFormatter
    );

    // Extract the improved question from the JSON response
    const parsedResult = JSON.parse(betterQuestionResult?.content as string);
    const betterQuestion = parsedResult?.improved_question || parsedResult?.query || parsedResult?.reframed_question || betterQuestionResult?.content;

    console.log("transformQuery...", betterQuestion);
    return {
        newQuery: betterQuestion,
    }

};

const webSearch = async (state: typeof StateAnnotation.State) => {

    // const tool = new TavilySearch({ tavilyApiKey: process.env.TAVILY_API_KEY });
    // const docs = await tool.invoke({ query: state.newQuery });

    const groq = new Groq({
        apiKey: process.env.GROQ_API_KEY,
    })
    // console.log(`state.newQuery: ${state.newQuery}`);
    const response = await groq.chat.completions.create({
        model: "groq/compound",
        messages: [
            {
                role: "user",
                content: `query: ${state.newQuery}`
            },
        ]
    });
    console.log(response.choices[0].message.content);

    // const webResult = docs?.results.map((doc: any) =>
    //     new Document({ pageContent: doc?.content, metadata: { title: doc?.title, url: doc?.url } }));

    console.log("webSearch...")
    return {
        retrievedDoc: response,
    }
};

const generate = async (state: typeof StateAnnotation.State) => {
    const lastMessage = extrectMessage(state, 'human');


    const docToString = formatDocumentsAsString(state.retrivedDoc);

    const generatorResPrompt = await response_generator_prompt.invoke({
        original_question: lastMessage?.content,
        questions: state.generateQuestion
            .join(", "),
        retrieved_docs: docToString,
    })

    const aiResponse = await llm.invoke([
        {
            role: "user",
            content: generatorResPrompt.value
        }
    ])
    // console.log("aiResponse:", aiResponse);
    // gradeDocResponseFormater
    console.log("generate...")
    return {
        messages: [aiResponse]
    }
};


const router = (state: typeof StateAnnotation.State) => {

    const filteredDocs = state.filteredDoc;
    if (filteredDocs.length === 0) {
        return "transformQuery"
    }
    return "generate"
};

const builder = new StateGraph(StateAnnotation)

    .addNode("RetrieverNode", RetrieverNode)
    .addNode("gradeDocNode", gradeDocNode)
    .addNode("generate", generate)
    .addNode("transformQuery", transformQuery)
    .addNode("webSearch", webSearch)
    // build graph
    .addEdge(START, "RetrieverNode")
    .addEdge('RetrieverNode', 'gradeDocNode')
    .addConditionalEdges('gradeDocNode', router)
    .addEdge("transformQuery", 'webSearch')
    .addEdge("webSearch", 'generate')
    .addEdge("generate", END);



const app = builder.compile();


// Invoke the graph
const result = await app.invoke({
    messages: [
        new HumanMessage({
            content: "Types of prompt engineering"
        })
    ]
});

// Option 1: Show only the AI's response
console.log("\n=== AI Response ===");
console.log(result.messages);

// Option 2: Show full state (uncomment if needed)
// console.log("Full Result: ", result);