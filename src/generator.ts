import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { ChatMessagePromptTemplate, ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts"
import dotenv from "dotenv";
import z from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import { queryVectorDB } from "./retriever";
dotenv.config();

const llm = new ChatOpenAI({
    model: 'gpt-5-mini',
    configuration: {
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: process.env.OPENAI_API_BASE_URL,


    }
})

const query = "What is few-shot?";

const result = await queryVectorDB(query);

const prompt= PromptTemplate.fromTemplate(`
You are an assistant for question-answering tasks. Use the following pieces of retrieved context
to answer the question. If you don't know the answer, just say that you don't know. Use three sentences maximum.
Question: {question}
Context: {context}
Answer:
`)

const promptVal = await prompt.invoke({
    question:query,
    context:result[0]?.pageContent

})

const llmResult = await llm.invoke([
    {
        role:"user",
        content: promptVal.value 
    }
])

console.log(llmResult)


