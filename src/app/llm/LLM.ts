import { ChatGroq } from "@langchain/groq";
import { ChatOpenAI } from "@langchain/openai";
export class LLM {
    private static instance: ChatGroq;
    // Private constructor to prevent direct instantiation 
    private constructor() { }

    public static getInstance(): ChatGroq {
        if (!LLM.instance) {
            if (!process.env.GROQ_API_KEY) {
                throw new Error("❌ GROQ_API_KEY is not set in environment variables");
            }
            LLM.instance = new ChatGroq({
                apiKey: process.env.GROQ_API_KEY,
                model: "moonshotai/kimi-k2-instruct-0905", // Change to your preferred Groq model
                temperature: 0.7,
            });
        }
        return LLM.instance;
    }
}