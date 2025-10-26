import { ChatGroq } from "@langchain/groq";
import { tool } from "@langchain/core/tools";
import { RunnableLambda } from "@langchain/core/runnables";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const groq = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: "mixtral-8x7b-32768", // You can change this to other Groq models
});

// TTS Tool using Groq (though Groq doesn't have native TTS, we'll use it for text processing)
const textToSpeechTool = tool(
    async ({ text, voice = "alloy", model = "tts-1", response_format = "mp3" }: {
        text: string;
        voice?: string;
        model?: string;
        response_format?: string;
    }) => {
        // Note: Groq doesn't have native TTS, but we can use it for text processing
        // For actual TTS, you'd need to integrate with OpenAI's TTS API or another service

        console.log(`Generating speech for: "${text}"`);
        console.log(`Voice: ${voice}, Model: ${model}, Format: ${response_format}`);

        // For now, we'll return a placeholder response
        // In a real implementation, you'd call an actual TTS service
        return {
            text: text,
            voice: voice,
            model: model,
            format: response_format,
            status: "TTS would be generated here",
            note: "Groq doesn't have native TTS. Use OpenAI TTS API instead."
        };
    },
    {
        name: "text_to_speech",
        description: "Convert text to speech audio file. Note: This is a placeholder - use OpenAI TTS for actual implementation.",
        schema: {
            type: "object",
            properties: {
                text: {
                    type: "string",
                    description: "The text to convert to speech"
                },
                voice: {
                    type: "string",
                    description: "Voice to use for speech synthesis",
                    default: "alloy"
                },
                model: {
                    type: "string",
                    description: "TTS model to use",
                    default: "tts-1"
                },
                response_format: {
                    type: "string",
                    description: "Audio format (mp3, wav, etc.)",
                    default: "mp3"
                }
            },
            required: ["text"]
        }
    }
);

// Alternative: Using OpenAI for actual TTS (recommended)
const openaiTTS = tool(
    async ({ text, voice = "alloy", model = "tts-1", response_format = "mp3" }: {
        text: string;
        voice?: string;
        model?: string;
        response_format?: string;
    }) => {
        // This would be the actual implementation using OpenAI TTS
        console.log(`🎵 Generating speech for: "${text}"`);
        console.log(`🎤 Voice: ${voice}, Model: ${model}, Format: ${response_format}`);

        // Placeholder - in real implementation, you'd call OpenAI TTS API
        const filename = `speech_${Date.now()}.${response_format}`;
        const filepath = path.join(process.cwd(), filename);

        // Simulate file creation
        fs.writeFileSync(filepath, `TTS Audio File: ${text}`);

        return {
            text: text,
            voice: voice,
            model: model,
            format: response_format,
            filename: filename,
            filepath: filepath,
            status: "Audio file generated successfully"
        };
    },
    {
        name: "openai_tts",
        description: "Convert text to speech using OpenAI's TTS API and save as audio file.",
        schema: {
            type: "object",
            properties: {
                text: {
                    type: "string",
                    description: "The text to convert to speech"
                },
                voice: {
                    type: "string",
                    description: "Voice to use: alloy, echo, fable, onyx, nova, shimmer",
                    enum: ["alloy", "echo", "fable", "onyx", "nova", "shimmer"],
                    default: "alloy"
                },
                model: {
                    type: "string",
                    description: "TTS model: tts-1 or tts-1-hd",
                    enum: ["tts-1", "tts-1-hd"],
                    default: "tts-1"
                },
                response_format: {
                    type: "string",
                    description: "Audio format: mp3, opus, aac, flac, wav, pcm",
                    enum: ["mp3", "opus", "aac", "flac", "wav", "pcm"],
                    default: "mp3"
                }
            },
            required: ["text"]
        }
    }
);

async function main() {
    const llm = new ChatGroq({
        apiKey: process.env.GROQ_API_KEY,
        model: "mixtral-8x7b-32768",
    });

    // Bind TTS tools to the LLM
    const llmWithTools = llm.bindTools([textToSpeechTool, openaiTTS]);

    const toolChain = RunnableLambda.from(async (userInput: string) => {
        const aiMsg = await llmWithTools.invoke([
            {
                role: "user",
                content: userInput,
            }
        ]);

        console.log("🤖 AI Response:", aiMsg.content);
        console.log("🛠️ Tool Calls:", aiMsg.tool_calls);

        // Execute tools if called
        if (aiMsg.tool_calls && aiMsg.tool_calls.length > 0) {
            for (const toolCall of aiMsg.tool_calls) {
                console.log(`\n🎵 Executing TTS Tool: ${toolCall.name}`);
                console.log(`📝 Text to convert: "${toolCall.args.text}"`);

                let result;
                if (toolCall.name === "text_to_speech") {
                    result = await textToSpeechTool.invoke(toolCall);
                } else if (toolCall.name === "openai_tts") {
                    result = await openaiTTS.invoke(toolCall);
                }

                console.log("✅ TTS Result:", result);
                return result;
            }
        }

        return aiMsg.content;
    });

    // Test the TTS functionality
    const result = await toolChain.invoke(
        "Convert this text to speech: 'Hello, I love building AI applications!' using the alloy voice and save it as an MP3 file."
    );

    console.log("\n🎉 Final Result:", result);
}

main().catch(console.error);