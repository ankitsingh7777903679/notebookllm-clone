import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { PromptTemplate, ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatFireworks } from "@langchain/community/chat_models/fireworks";
import zodToJsonSchema from "zod-to-json-schema"; import z from "zod";
import { formatDocumentsAsString } from "langchain/util/document";
import { Document } from "@langchain/core/documents";
import { Runnable } from "@langchain/core/runnables";

const generate_title_prompt = PromptTemplate.fromTemplate(`
You are a helpful assistant that generates concise and clear titles. 
Based on the following document content, create a single title that 
captures the main theme or subject of the document. 
Return the result as a JSON object with a "title" key.

Document Content: 
{document}    
Title:
`)

export async function generateTitle<T extends Runnable>(llm: T, doc: Document<Record<string, any>>[]) {
    const docToString = formatDocumentsAsString(doc)

    // console.log("Document to String: ", docToString)
    const chain = generate_title_prompt.pipe(llm)

    const chainResult = await chain.invoke({
        document: docToString
    }, {
        response_format: {
            type: "json_object",
            schema: zodToJsonSchema(
                z.object({
                    title: z.string().min(3).max(120)
                })
            )
        }
    } as any)

    try {
        const result = JSON.parse(chainResult?.content as string) 
        const generateTitle=result?.title 
        return generateTitle || "Untitled Document"
    } catch (error) {
        console.error("Error parsing title generation result:", error);
        return "Untitled Document";
    }

}

