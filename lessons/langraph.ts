
import readline from "readline/promises";
import { MessagesAnnotation, StateGraph, MemorySaver } from "@langchain/langgraph"
import { TavilySearch } from "@langchain/tavily";
import { HumanMessage } from "@langchain/core/messages";
import { ChatGroq } from "@langchain/groq";
import dotenv from "dotenv";
import { ToolNode } from "@langchain/langgraph/prebuilt"
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import Groq from "groq-sdk"
import { ChatOpenAI } from "@langchain/openai";
import { ChatMessagePromptTemplate, ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts"



dotenv.config();
const chatGroq = new ChatGroq({
    model: 'groq/compound',
    defaultHeaders: {
        "Groq-Model-Version": "latest"
    }

})

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
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

// tools adding
// text to speech tool
import fs from "fs";
import path from "path";
import { threadId } from "worker_threads";
const textToSpeech = tool(
    async ({ text, voice = "Arista-PlayAI", model = "playai-tts", response_format = "wav" }) => {
        console.log("Generating speech...");
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
        description: "🔉 Convert text to speech.",
        schema: z.object({
            text: z.string().describe("The text to convert to speech"),
            voice: z.string().optional().default("Fritz-PlayAI").describe("Voice to use for speech (e.g., Fritz-PlayAI, other PlayAI voices)"),
            model: z.string().optional().default("playai-tts").describe("TTS model to use"),
            response_format: z.enum(["wav", "mp3", "flac"]).optional().default("wav").describe("Audio format for the output")

        }),
    }
);

// image generation tool
const generateImage = tool(
    async ({ prompt }) => {
        // Dynamically import the ESM-only client at runtime to avoid CommonJS/ESM interop errors
        console.log("Generating image...");
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

    }, {
    name: "generateImage",
    description: "Use for generating images.",
    schema: z.object({
        prompt: z.string().describe("The text prompt to generate the image from"),
    }),
}
)

// speech to text tool
const speechToText = tool(
    async ({ filePath, language, prompt }) => {
        console.log(`Transcribing audio in ${language}...`);
        const transcription = await groq.audio.transcriptions.create({
            file: fs.createReadStream(filePath), // Required path to audio file - replace with your audio file!
            model: "whisper-large-v3", // Required model to use for transcription
            prompt: prompt || "Specify context or spelling", // Optional
            response_format: "verbose_json", // Optional
            timestamp_granularities: ["word", "segment"], // Optional (must set response_format to "json" to use and can specify "word", "segment" (default), or both)
            language: language, // Optional
            temperature: 0.0, // Optional
        });

        return {
            success: true,
            message: "Audio transcribed successfully.",
            text: transcription.text,
            language: language || "en",
            model: "whisper-large-v3-turbo",
            format: "verbose_json"


        }
    }, {
    name: "speechToText",
    description: "Convert speech to text any language.",
    schema: z.object({
        filePath: z.string().describe("Path to the audio file to transcribe"),
        language: z.string().optional().describe("Language of the audio (ISO 639-1 format)"),
        prompt: z.string().optional().default("Specify context or spelling").describe("Optional context or spelling guidance for transcription"),
        temperature: z.number().min(0).max(1).optional().describe("Sampling temperature between 0 and 1"),
        response_format: z.enum(["json", "text", "srt", "verbose_json"]).optional().describe("Format of the response")
    })
}
)

// search tool
const visitWbsiteTool = tool(
    async ({ query }) => {
        console.log("Searching....");
        const result = await chatGroq.invoke([
            {
                "role": "user",
                "content": query,
            }
        ]);
        return result;
    },
    {
        name: "visitWbsite",
        description: "Use for searching and visiting and analyzing specific websites.",
        schema: z.object({
            query: z.string(),
        }),
    }
)
// tools adding
const tools: any[] = [visitWbsiteTool, textToSpeech, generateImage, speechToText];
const toolNode = new ToolNode(tools)

const llm = new ChatOpenAI({
    model: 'gpt-4o-mini',
    configuration: {
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: process.env.OPENAI_API_BASE_URL,


    }
}).bindTools(tools)

// const llm = new ChatGroq({
//     apiKey: process.env.GROQ_API_KEY,
//     model: 'openai/gpt-oss-20b',
//     temperature: 0,


// }).bindTools(tools)

async function callModel(state: typeof MessagesAnnotation.State) {
    // Simulate a model call
    console.log("Calling Llm...");
    const response = await llm.invoke(state.messages)
    return {
        messages: [response]

    };
}


interface ShouldContinueState {
    messages: typeof MessagesAnnotation.State['messages'];
}

function shouldContinue(state: ShouldContinueState): string {
    const lastMessage = state.messages[state.messages.length - 1];

    // console.log("stat", state)

    if ("tool_calls" in lastMessage && Array.isArray(lastMessage.tool_calls) && lastMessage.tool_calls?.length) {
      return "tools";
  }

    return '_end_';
}

const workFlow = new StateGraph(MessagesAnnotation)
    .addNode('agent', callModel)
    .addNode('tools', toolNode)
    .addEdge("__start__", "agent")
    .addEdge("tools", "agent")
    // .addEdge("agent", "__end__")
    .addConditionalEdges("agent", shouldContinue);

const memorySaver = new MemorySaver()
const app = workFlow.compile({checkpointer: memorySaver});

async function main() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })

    while (true) {
        const userInput = await rl.question("You: ");
        if (userInput.toLocaleLowerCase() === 'exit') {
            console.log("Exiting...");
            break;
        }

        const finalState = await app.invoke({
            messages: [{ role: "user", content: userInput }],
        },{
            configurable:{thread_id:'1'}
        })
        const lastMessage = finalState.messages[finalState.messages.length - 1];

        console.log("Final state:", lastMessage.content);
    }
    rl.close();
}

main();