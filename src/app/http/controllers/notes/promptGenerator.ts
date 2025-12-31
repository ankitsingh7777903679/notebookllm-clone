import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { PromptTemplate, ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatFireworks } from "@langchain/community/chat_models/fireworks";
import "dotenv/config";
import zodToJsonSchema from "zod-to-json-schema";
import z from "zod";
import { Runnable } from "@langchain/core/runnables";
import { title } from "process";


export async function generatePrompt<T extends Runnable>(llm: T, title: string): Promise<string> {
    const prompt_image_generator = PromptTemplate.fromTemplate(` 
        You are an expert prompt .engineer for an AI image generator. Your task is to take the user's input, which is a document title, and create a single, concise prompt to generate a logo for it.  
        The prompt you create must instruct the image generator to produce: 
        * A ** minimalist and modern vector icon ** that visually represents the title. 
        * The style should be ** flat design ** with clean, simple lines. 
        * The final image must be ** only the logo with a transparent background **.  
        
        Your output should be the prompt itself, and nothing more.  
        Here is the user's input: ** {input} ***`
    )


    const chain = prompt_image_generator.pipe(llm)
    const chainResult = await chain.invoke({
        input: title,
    }, {
        response_format: {
            type: "json_object",
            schema: zodToJsonSchema(
                z.object({
                    prompt: z.string()
                })
            )
        }
    } as any)
    const result = JSON.parse(chainResult?.content as string)
    const prompt = result?.prompt
    return prompt
}



