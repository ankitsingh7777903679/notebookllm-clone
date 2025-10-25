import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { ChatMessagePromptTemplate, ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts"
import dotenv from "dotenv";
import z from "zod";
import zodToJsonSchema from "zod-to-json-schema";
dotenv.config();

const llm = new ChatOpenAI({
    model: 'gpt-4o-mini',
    configuration: {
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: process.env.OPENAI_API_BASE_URL,


    }
})

const prompt = ChatPromptTemplate.fromMessages(
    [
        [
            "system",
            `You are a professional Math expert, your job is solve user's questions related to Math.
           Think step by step through your reasoning and explain your thought.
            
           Instructions:
           - return only the value of x
           ` ,
        ],
        [
            "user", "here's the user question: {input}"
        ]
    ]);
// const prompt = PromptTemplate.fromTemplate(`
//     You are a professional Math expert, your job is solve user's questions related to Math.
//     Think step by step through your reasoning and explain your thought.

//     here's the user question:
//      {input} 
// `)

async function main() {

    const chain = prompt.pipe(llm)

    const chainResult = await chain.invoke({
        input: "x+y=0, what is value of x"
    })


    // const invokePrompt = await prompt.invoke({ input: "x+y=0, what is value of x" });

    

    // const result = await chat.invoke(invokePrompt, {
    //     response_format: {
    //       type: "json_object",
    //       schema: zodToJsonSchema(
    //         z.object({
    //             value_of_x: z.string(),
    //         })
    //       )

    //     }
    // }
    
// );

console.log(chainResult.content);
}

main();

// const message = [
//     new SystemMessage(`
//         You are a professional Math expert, your job is solve  user's questions related to Math.
//         eg: hello: Bonjour

//         Do not return anythingelse.


//     `),

// new HumanMessage(`
//     x+y=0, what is value of x?
// `)
// {
//     role: "user",
//     content: "Hello, how are you?"
// },



// async function main() {
//     const response = await chat.invoke(message)
//     console.log(response.content);
// }

// main().catch(console.error);




