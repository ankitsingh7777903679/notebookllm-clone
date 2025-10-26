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
import { ChatGroq } from "@langchain/groq";
import { vi } from "zod/v4/locales";
import fs from "fs";
import path from "path";
// Use dynamic import for ESM-only package '@gradio/client' where it's needed
import { sync } from "resolve";

const llm = new ChatOpenAI({
    model: 'gpt-5-mini',
    configuration: {
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: process.env.OPENAI_API_BASE_URL,


    }
})

async function titleORFileNameGenrate(query: string, titleType: String) {
    const prompt = ChatPromptTemplate.fromMessages([
        [
            "system",
            `You are an expert ${titleType} generator AI. Your task is to create concise, relevant, and professional ${titleType}s based on user queries.

            **Guidelines:**
            - Generate only the ${titleType} - no explanations, prefixes, or additional text
            - Keep it short (3-8 words maximum) and descriptive
            - Make it SEO-friendly and engaging if applicable
            - Use title case for readability
            - Ensure it's directly relevant to the query content
            - Avoid generic phrases; be specific and creative when possible
            - For filenames, use snake_case or kebab-case with no spaces or special characters

            **Examples:**
            - Query: "best practices for React development" → Title: "React Development Best Practices"
            - Query: "how to cook pasta carbonara" → Title: "Authentic Pasta Carbonara Recipe"
            - Query: "machine learning algorithms explained" → Title: "Machine Learning Algorithms Guide"
            - Query: "hello world speech" → Filename: "hello-world-speech"`
        ],
        [
            "user", "Generate a ${titleType} for this query: {query}"
        ]
    ]);
    const chain = prompt.pipe(llm);

    const chainResult = await chain.invoke({
        query: query,
        titleType: titleType
    });
    return chainResult;
}

const groq = new ChatGroq({
    model: 'groq/compound',
    defaultHeaders: {
        "Groq-Model-Version": "latest"
    }

})

const visitWbsiteTool = tool(
    async ({ query }) => {
        const result = await groq.invoke([
            {
                "role": "user",
                "content": query,
            }
        ]);
        return result;
    },
    {
        name: "visitWbsite",
        description: "Use for visiting and analyzing specific websites.",
        schema: z.object({
            query: z.string(),
        }),
    }
)

const textToSpeech = tool(
    async ({ text, voice = "Arista-PlayAI", model = "playai-tts", response_format = "wav" }) => {
        const response = await fetch("https://api.groq.com/openai/v1/audio/speech", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: model,
                input: text,
                voice: voice,
                response_format: response_format,
            }),
        });
        const title = await titleORFileNameGenrate(text, 'fileName');

        console.log("Generated title:", title.content);
        const speechFile = path.resolve(`./genAudio/${title.content}.wav`);
        console.log(response);

        // Convert response to buffer and save file
        const buffer = Buffer.from(await response.arrayBuffer());
        await fs.promises.writeFile(speechFile, buffer);

        return {
            success: true,
            message: "Speech generated successfully using Groq TTS API",
            filePath: speechFile,
            text: text,
            voice: "Arista-PlayAI",
            model: "playai-tts",
            format: "wav"
        }

    },
    {
        name: "textToSpeech",
        description: "Convert text to speech.",
        schema: z.object({
            text: z.string().describe("The text to convert to speech"),
            voice: z.string().optional().default("Fritz-PlayAI").describe("Voice to use for speech (e.g., Fritz-PlayAI, other PlayAI voices)"),
            model: z.string().optional().default("playai-tts").describe("TTS model to use"),
            response_format: z.enum(["wav", "mp3", "flac"]).optional().default("wav").describe("Audio format for the output")

        }),
    }
);

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
            title: z.string().describe("short title for the query"),
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

const generateImage = tool(
    async ({prompt}) => {
        // Dynamically import the ESM-only client at runtime to avoid CommonJS/ESM interop errors
        const { Client } = await import("@gradio/client");
        const client = await Client.connect('NihalGazi/FLUX-Unlimited')
        const result = await client.predict("/generate_image", {
            prompt: prompt,
            width: 512,
            height: 512,
            seed: 3,
            randomize: true,
            server_choice: "Google US Server"
        });
        console.log("Image generation result:", result);
        const imageUrl = result.data[0].url;

        // download image
        const imageResponse = await fetch(imageUrl);

        const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

        const title = await titleORFileNameGenrate(prompt, 'fileName');

        console.log("Generated title:", title.content);
        const imagePath = path.resolve(`./genImage/${title.content}.png`);

        await fs.promises.writeFile(imagePath, imageBuffer);

        return {
            success: true,
            message: "Image generated successfully using FLUX Unlimited",
            filePath: imagePath,
            prompt: prompt,
        }

    },{
        name: "generateImage",
        description: "Use for generating images.",
        schema: z.object({
            prompt: z.string().describe("The text prompt to generate the image from"),
        }),
    }
)

async function main() {
    const chain = llm.bindTools([multiply, tavilyTool, visitWbsiteTool, textToSpeech, generateImage]);

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

            // Print the query from the tool call


            if (toolCall.name === "multiply") {
                console.log("Executing multiply tool with args:", toolCall.args);
                toolMsgs = [await multiply.invoke(toolCall)];
            } else if (toolCall.name === "tavily") {
                console.log("Executing tavily tool with args:", toolCall.args);
                console.log("Tool Query:", toolCall.args.query);
                toolMsgs = await tavilyTool.batch([toolCall]);
            } else if (toolCall.name === "visitWbsite") {
                console.log("Executing visitWbsite tool with args:", toolCall.args);
                toolMsgs = await visitWbsiteTool.batch([toolCall]);
            } else if (toolCall.name === "textToSpeech") {
                console.log("Executing textToSpeech tool with args:", toolCall.args);
                toolMsgs = [await textToSpeech.invoke(toolCall)];
            }else if (toolCall.name === "generateImage") {  // ✅ Added: Handle generateImage tool calls
                console.log("Executing generateImage tool with args:", toolCall.args);
                toolMsgs = [await generateImage.invoke(toolCall)];
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

    const result = await toolChain.invoke("write a 1000 words baby story and convert the story to speech");

    // console.log("result:", result[0]);
    console.log("--------------------------------\n\n");
    console.log("result:::", result.content);



}


main();


