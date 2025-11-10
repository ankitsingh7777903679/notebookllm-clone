// import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
// import { ChatOpenAI } from "@langchain/openai";
// import { ChatMessagePromptTemplate, ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts"
// import { DocumentInterface } from "@langchain/core/documents";
// import dotenv from "dotenv";
// import { ChatGroq } from "@langchain/groq";
// import { Document } from "@langchain/core/documents";
import z from "zod";
// // import { formatDocumentsAsString } from "langchain/util/document";
// import { formatDocumentsAsString } from "langchain/util/document";

// // import {response_generator_prompt} from "./prompts";

// // import zodToJsonSchema from "zod-to-json-schema";
// // import { queryVectorDB } from "../src/pipelines/retriever";
// // import { parse } from "path";
// // import {reciprocalRankFusion} from "../src/pipelines/RRF";
// dotenv.config();

// const llm = new ChatOpenAI({
//     model: 'gpt-4o-mini',
//     configuration: {
//         apiKey: process.env.OPENAI_API_KEY,
//         baseURL: process.env.OPENAI_API_BASE_URL,


//     }
// })
// const groqLlm = new ChatGroq({
//     model: 'openai/gpt-oss-20b',
//     apiKey: process.env.GROQ_API_KEY,
// })

// const query = "What is prompt engineering?";

// const result = await queryVectorDB(query);

// const generate_question_prompt = PromptTemplate.fromTemplate(`

// You are an AI search assistant.
// The user asked: {question}

// Step back and consider this question more broadly:
// 1. Reframe it in general terms.
// 2. Identify the main themes or dimensions involved.
// 3. Generate 5 diverse search queries that cover these dimensions,
// ensuring each query explores a different perspective or phrasing.
// `);
// const generateQuestionPrompt = await generate_question_prompt.invoke({
//     question: query,

// })

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
// const questions = llmResult.questions;

// const allRetrivedDocs = [] as Document[][];
// for (const question of questions) {
//     const result = await queryVectorDB(question);
//     allRetrivedDocs.push(result);
// }
// const fesedDoc = reciprocalRankFusion(allRetrivedDocs); // Take top 10 documents
// const docToString = formatDocumentsAsString(fesedDoc);

// const generatorResPrompt = await response_generator_prompt.invoke({
//     original_question: query,
//     questions: questions.join(", "),
//     retrieved_docs: docToString,
// })

// const aiResponse = await llm.invoke([
//     {
//         role: "user",
//         content: generatorResPrompt.value
//     }
// ])

// console.log("aiResponse:", aiResponse); // Add label to see what's returned
// console.log(llmResult.questions); // This will give you the 5 questions array


