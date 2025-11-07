import readLine from "node:readline/promises";
import * as z from "zod";
import { createAgent, DecisionType, humanInTheLoopMiddleware, tool } from "langchain";
import { ChatOpenAI } from "@langchain/openai";
import dotenv from "dotenv";
import { Command, MemorySaver } from "@langchain/langgraph";
dotenv.config();

const llm = new ChatOpenAI({
    model: "gpt-4o-mini",
    configuration: {
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: process.env.OPENAI_API_BASE_URL,
    },
});
const gmailEmails = {
    message: [
        {
            id: '18c3f2a1b5d6e789',
            threadId: '18c3f2a1b5d6e789',
            labelIds: ['INBOX', 'UNREAD'],
            snippet: "Hi, I purchased your JavaScript masterclass course last week but I would like to request a refund. The course content doesn't match what was advertised...",
            payload: {
                headers: [
                    { name: 'From', value: 'john.doe@example.com' },
                    { name: 'To', value: 'support@codersgyan.com' },
                    { name: 'Subject', value: 'Refund Request - JavaScript Course' },
                    { name: 'Date', value: 'Mon, 4 Nov 2024 10:30:00 +0000' },
                ],
                body: {
                    data: 'SGksIEkgcHVyY2hhc2VkIHlvdXIgSmF2YVNjcmlwdCBtYXN0ZXJjbGFzcyBjb3Vyc2UgbGFzdCB3ZWVrIGJ1dCBJIHdvdWxkIGxpa2UgdG8gcmVxdWVzdCBhIHJlZnVuZC4gVGhlIGNvdXJzZSBjb250ZW50IGRvZXNuJ3QgbWF0Y2ggd2hhdCB3YXMgYWR2ZXJ0aXNlZC4=',
                },
                internalDate: '1730715000000',
            },
        },
        {
            id: '18c3f2a1b5d6e792',
            threadId: '18c3f2a1b5d6e792',
            labelIds: ['INBOX', 'UNREAD'],
            snippet: "Important: We are excited to announce the launch of our new Advanced TypeScript course! Early bird discount of 40% available until November 15th...",
            payload: {
                headers: [
                    { name: 'From', value: 'announcements@codersgyan.com' },
                    { name: 'To', value: 'subscribers@codersgyan.com' },
                    { name: 'Subject', value: 'New Course Launch - Advanced TypeScript' },
                    { name: 'Date', value: 'Thu, 7 Nov 2024 08:00:00 +0000' },
                ],
                body: {
                    data: 'SW1wb3J0YW50OiBXZSBhcmUgZXhjaXRlZCB0byBhbm5vdW5jZSB0aGUgbGF1bmNoIG9mIG91ciBuZXcgQWR2YW5jZWQgVHlwZVNjcmlwdCBjb3Vyc2UhIEVhcmx5IGJpcmQgZGlzY291bnQgb2YgNDAlIGF2YWlsYWJsZSB1bnRpbCBOb3ZlbWJlciAxNXRoLg==',
                },
                internalDate: '1730964000000',
            },
        },
        {
            id: '18c3f2a1b5d6e793',
            threadId: '18c3f2a1b5d6e793',
            labelIds: ['INBOX', 'UNREAD'],
            snippet: "Refund Request - Order #98765. I am writing to request a full refund for my recent purchase. The product arrived damaged and does not work as described...",
            payload: {
                headers: [
                    { name: 'From', value: 'sarah.miller@example.com' },
                    { name: 'To', value: 'returns@techstore.com' },
                    { name: 'Subject', value: 'Refund Request - Order #98765' },
                    { name: 'Date', value: 'Fri, 8 Nov 2024 16:45:00 +0000' },
                ],
                body: {
                    data: 'UmVmdW5kIFJlcXVlc3QgLSBPcmRlciAjOTg3NjUuIEkgYW0gd3JpdGluZyB0byByZXF1ZXN0IGEgZnVsbCByZWZ1bmQgZm9yIG15IHJlY2VudCBwdXJjaGFzZS4gVGhlIHByb2R1Y3QgYXJyaXZlZCBkYW1hZ2VkIGFuZCBkb2VzIG5vdCB3b3JrIGFzIGRlc2NyaWJlZC4=',
                },
                internalDate: '1731082500000',
            },
        },
    ],
    resultSizeEstimate: 3,
}

const getEmail = tool(
    () => {

        return JSON.stringify(gmailEmails)

    },
    {
        name: "getEmail",
        description: "Get the email from inbox.",
    }
);

const refund = tool(
    ({ emails }) => {

        return "✅ All refund processed successfully."

    },
    {
        name: "refund",
        description: "Process the refund for given emails",
        schema: z.object({
            emails: z.array(z.string()).describe("The list of emails which need to be refunded"),
        })
    }
);



const agent = createAgent({
    model: llm,
    tools: [getEmail, refund],
    middleware: [
        humanInTheLoopMiddleware({
            interruptOn: { refund: true },
            descriptionPrefix: 'Refund pending approval.'
        })
    ],
    checkpointer: new MemorySaver()
});

async function run() {
    const rl = readLine.createInterface({
        input: process.stdin,
        output: process.stdout
    });
 const interrupts = [];
    const resume = {};
    while (true) {
        const query = await rl.question("Enter your query: ");
        if (query.toLocaleLowerCase() === 'exit') {
            break;
        }

        const response = await agent.invoke(
            interrupts.length
                ?new Command({resume:{
                    [interrupts?.[0]?.id]: {
                        decision: [{type:query === '1' ? 'approve' : 'reject'}]
                    }
                }})
            :{
            messages: [
                {
                    role: "user",
                    content: query
                }
            ]
        },
            {
                configurable: {
                    thread_id: '1'
                }
            }
        )

        let output = '';

        if (response.__interrupt__?.length) {
            const interrupt = response.__interrupt__[0] as any;
            interrupts.push(interrupt);
            output += interrupt.value.actionRequests[0].description + '\n\n';
            output += "Choose: \n";
            output += interrupt.value.reviewConfigs[0].allowedDecisions.filter(
                (decision: string) => decision !== 'edit'
            ).map((Decision: string, idx: number) => (`${idx + 1}. ${Decision}`)).join('\n');
        }

        console.log(output);

    }


} run();