import zodToJsonSchema from "zod-to-json-schema";
import z from "zod";

export function extrectMessage(state: any, messageType: 'ai' | 'human') {
    const lastMessage = state.messages
        .filter((m: any) => m.getType() === messageType)
        .slice(-1)[0];
    return lastMessage;
}

export const questionResponseFormater = {
    response_format: {
        type: "json_object",
        schema: zodToJsonSchema(
            z.object({
                questions: z.array(z.string())


            })
        )
    }
} as any

export const gradeDocResponseFormater = {
    response_format: {
        type: "json_object",
        schema: zodToJsonSchema(
            z.object({
                binaryScore: z
                    .enum(["yes", "no"])
                    .describe("Relevance score 'yes' or.'no'"),
            })
                .describe(
                    "Grade the relevance of the retrieved documents to the question.Either'yes' or 'no'."
                )
        )
    }
} as any

export const TranformResponseFormatter = {
    response_format: {
        type: "json_object",
        schema: zodToJsonSchema(
            z.object({
                question: z.string()
            })
        )
    }

} as any
