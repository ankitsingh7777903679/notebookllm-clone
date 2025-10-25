import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { ChatMessagePromptTemplate, ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts"
import dotenv from "dotenv";
import z from "zod";
import zodToJsonSchema from "zod-to-json-schema";
dotenv.config();
import { TavilySearch } from "@langchain/tavily";
import { tool } from "@langchain/core/tools";
import { Runnable, RunnableLambda } from "@langchain/core/runnables";

const llm = new ChatOpenAI({
    model: 'gpt-4o-mini',
    configuration: {
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: process.env.OPENAI_API_BASE_URL,


    }
})

const tavily = new TavilySearch({
    tavilyApiKey: process.env.TAVILY_API_KEY,
    maxResults: 5,
    topic: "general",

})

const tavilyTool = tool(
    async ({ query }) => {
        const result = await tavily.invoke({ query: query });
        return result;
    },
    {
        name: "tavily",
        description: "Search the web using Tavily to find real-time information.",
        schema: z.object({
            query: z.string(),
        }),
    }
)

const multiply = tool(
    ({ a, b }: { a: number; b: number }): number => {
        /**
         * Multiply a and b.
         */
        return a * b;
    },
    {
        name: "multiply",
        description: "Multiply two numbers",
        schema: z.object({
            a: z.number(),
            b: z.number(),
        }),
    }
);

async function main() {
    const chain = llm.bindTools([multiply, tavilyTool]);

    // const result = await llmWithTools.invoke(
    //     [
    //         {
    //             role: "user",
    //             content: "What is 2 multiplied by 3?.",
    //         }

    //     ]
    // );

    const toolChain = RunnableLambda.from(async (userInput: string) => {
        const humanMessage = new HumanMessage(userInput);

        const aiMsg = await chain.invoke(
            [{
                role: "user",
                content: userInput,

            }]
        );
        console.log("aiMsg:", aiMsg);


        // const toolMsgs = await tavilyTool.batch(aiMsg.tool_calls as any)

        // Check which tool was called and execute the appropriate one
        let toolMsgs = [];
        if (aiMsg.tool_calls && aiMsg.tool_calls.length > 0) {
            const toolCall = aiMsg.tool_calls[0];
            
            if (toolCall.name === "multiply") {
                console.log("Executing multiply tool with args:", toolCall.args);
                toolMsgs = [await multiply.invoke(toolCall)];
            } else if (toolCall.name === "tavily") {
                console.log("Executing tavily tool with args:", toolCall.args);
                toolMsgs = await tavilyTool.batch([toolCall]);
            }
        }

        const chainResult = await chain.invoke([
            {
                role: "user",
                content: userInput,
            },
            aiMsg,
            ...toolMsgs,
        ])
        // console.log("toolMsgs:", toolMsgs);
        return chainResult;

    })

    const result = await toolChain.invoke("what is 3 multiplied by 4 ");

    // console.log("result:", result[0]);
    console.log("--------------------------------\n\n");
    console.log("result:::", result.content);



}


main();


