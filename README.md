# NotebookLM Clone

A TypeScript-based AI toolkit leveraging LangChain, OpenAI's GPT models, and Groq for intelligent document analysis, conversational AI, text-to-speech, and image generation capabilities.

## 🚀 Features

- **AI-Powered Chat**: Interact with documents using OpenAI's GPT-4o-mini model
- **Tool Calling**: Execute functions and APIs through AI
  - ✅ **Multiplication**: Perform math calculations
  - ✅ **Web Search**: Real-time search using Tavily API
  - ✅ **Website Visitor**: Fetch and analyze web content
  - ✅ **Text-to-Speech**: Convert text to audio using Groq's PlayAI TTS
  - ✅ **Image Generation**: Create images using FLUX Unlimited model
- **LangChain Integration**: Built with LangChain for robust AI workflows
- **Runnable Chains**: Chain multiple operations together
- **Structured Output**: Get typed responses with Zod schemas
- **TypeScript**: Fully typed for better development experience
- **Smart File Naming**: AI-generated filenames for outputs

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key
- Groq API key (for text-to-speech)
- Tavily API key (for web search functionality)

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/ankitsingh7777903679/notebookllm-clone.git
cd notebookllm-clone
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_API_BASE_URL=https://api.chatanywhere.tech/v1
GROQ_API_KEY=your_groq_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
LANGSMITH_API_KEY=your_langsmith_api_key_here
LANGSMITH_TRACING=true
LANGSMITH_ENDPOINT=https://api.smith.langchain.com
LANGSMITH_PROJECT=your_project_name
```

## 🏃 Running the Project

### Development Mode

Watch mode (auto-recompile on changes):
```bash
npm run watch
# or
npm run dev
```

### Build and Run

1. Build the TypeScript code:
```bash
npm run build
```

2. Start the application:
```bash
npm start
```

### Run Specific Examples

```bash
# Run tool calling examples
npm run runnable

# Run runnable chains
npm run runnable
```

### Direct TypeScript Execution

```bash
# Run TypeScript files directly
npx tsx src/tools.ts
npx tsx src/runnable.ts
```

## 📁 Project Structure

```
notebookllm-clone/
├── src/
│   ├── index.ts          # Main entry point with structured output
│   ├── langraph.ts       # LangGraph agentic workflow with state management
│   ├── tools.ts          # AI tools: TTS, image gen, web search, math
│   ├── runnable.ts       # Runnable chains and sequences
│   └── tts.ts            # Text-to-speech utilities
├── genAudio/             # Generated audio files output
├── genImage/             # Generated image files output
├── dist/                 # Compiled JavaScript output
├── tsconfig.json         # TypeScript configuration
├── package.json          # Project dependencies
├── .env                  # Environment variables (not in repo)
└── README.md             # This file
```

## 🔧 Configuration

### TypeScript Configuration

The project uses the following TypeScript settings:
- **Target**: ES2022
- **Module**: ES2022
- **Module Resolution**: bundler
- **Strict Mode**: Enabled
- **Source Maps**: Enabled
- **Skip Lib Check**: Enabled

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | Yes |
| `OPENAI_API_BASE_URL` | OpenAI API base URL (or proxy) | Yes |
| `GROQ_API_KEY` | Groq API key for text-to-speech | Yes |
| `TAVILY_API_KEY` | Tavily API key for web search | Yes |
| `LANGSMITH_API_KEY` | LangSmith API key for tracing | Optional |
| `LANGSMITH_TRACING` | Enable LangSmith tracing (true/false) | Optional |

## 📚 Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `npm run build` | `tsc` | Compile TypeScript to JavaScript |
| `npm start` | `node dist/index.js` | Run the compiled application |
| `npm run watch` | `tsc --watch` | Watch mode with auto-recompile |
| `npm run dev` | `tsc --watch` | Alias for watch mode |
| `npm run runnable` | `tsx src/tools.ts` | Run tool calling examples |
| `npm run lang` | `tsx src/langraph.ts` | Run LangGraph agentic workflow |

---

## 🧠 Architecture Deep Dive

### 📂 `langraph.ts` - LangGraph Agentic Workflow

**What is LangGraph?**

LangGraph is a state management framework for building stateful, multi-actor applications with LLMs. It extends LangChain with the ability to create cyclical graphs, perfect for building agents that can:
- Make decisions
- Call tools
- Loop back with results
- Maintain conversation memory

#### **How `langraph.ts` Works**

```typescript
// 1. STATE DEFINITION
// MessagesAnnotation automatically manages message history
const workFlow = new StateGraph(MessagesAnnotation)
```

The workflow consists of **nodes** (actions) and **edges** (connections):

##### **🔷 Nodes:**

1. **`agent` Node** - The LLM brain
   ```typescript
   async function callModel(state: typeof MessagesAnnotation.State) {
       const response = await llm.invoke(state.messages)
       return { messages: [response] };
   }
   ```
   - Receives conversation state
   - Decides whether to use tools or respond directly
   - Returns updated state with new message

2. **`tools` Node** - Tool executor
   ```typescript
   const toolNode = new ToolNode(tools)
   ```
   - Executes tools requested by the agent
   - Returns tool results back to the workflow

##### **🔷 Edges:**

```typescript
.addEdge("__start__", "agent")        // Entry point → agent
.addEdge("tools", "agent")             // Tool results → back to agent
.addConditionalEdges("agent", shouldContinue)  // Agent decides next step
```

##### **🔷 Conditional Routing:**

```typescript
function shouldContinue(state: ShouldContinueState): string {
    const lastMessage = state.messages[state.messages.length - 1];
    
    // Check if agent wants to call tools
    if ("tool_calls" in lastMessage && 
        Array.isArray(lastMessage.tool_calls) && 
        lastMessage.tool_calls?.length) {
        return "tools";  // ✅ Route to tools node
    }
    return '__end__';    // ✅ End conversation
}
```

**Decision Logic:**
- If LLM response contains `tool_calls` → Go to `tools` node
- If no tool calls → End workflow with `__end__`

##### **🔷 Workflow Graph:**

```
┌─────────┐
│ __start__│
└────┬────┘
     │
     ▼
┌─────────────┐
│    agent    │──────► Check for tool calls
└──────┬──────┘
       │
       ├──► Has tool_calls? ──► ┌───────┐
       │                        │ tools │
       │                        └───┬───┘
       │                            │
       │                            ▼
       │           ◄────────────────┘
       │           (Loop back to agent)
       │
       └──► No tool_calls? ──► __end__
```

##### **🔷 Memory/State Persistence:**

```typescript
const memorySaver = new MemorySaver()
const app = workFlow.compile({checkpointer: memorySaver});

// Invoke with thread_id for conversation memory
await app.invoke(
    { messages: [{ role: "user", content: userInput }] },
    { configurable: { thread_id: '1' } }
)
```

- **MemorySaver**: Stores conversation state in memory
- **thread_id**: Groups messages by conversation thread
- **Persistent Context**: Agent remembers previous interactions

##### **🔷 Tools Available:**

1. **`visitWbsite`** - Web content analyzer
2. **`textToSpeech`** - Convert text → audio (Groq PlayAI)
3. **`generateImage`** - Text → image (FLUX Unlimited)
4. **`speechToText`** - Audio → text (Whisper v3)

#### **Workflow Example:**

```
User: "Generate an image of a sunset and convert 'Hello' to speech"

1. __start__ → agent
2. agent analyzes query → finds 2 tool calls needed
3. agent → tools (executeImage generation)
4. tools → agent (with image result)
5. agent → tools (execute TTS)
6. tools → agent (with audio result)
7. agent → __end__ (returns final response)
```

#### **Key Features:**

✅ **Stateful Conversations** - Maintains context across turns  
✅ **Automatic Tool Routing** - Agent decides when to use tools  
✅ **Cyclical Execution** - Tools can loop back to agent  
✅ **Memory Persistence** - Conversation history saved  
✅ **Type Safety** - Full TypeScript typing  
✅ **Error Handling** - Graceful failures  

---

### 📂 `tools.ts` - AI Tool Collection & Manual Orchestration

**What is `tools.ts`?**

This file implements a **manual tool calling approach** using LangChain's `RunnableLambda` for sequential tool execution without state graphs.

#### **Architecture:**

```typescript
// 1. Define LLM with tools bound
const chain = llm.bindTools([
    multiply, 
    tavilyTool, 
    visitWbsiteTool, 
    textToSpeech, 
    generateImage, 
    speechToText
]);

// 2. Create manual orchestration lambda
const toolChain = RunnableLambda.from(async (userInput: string) => {
    // Step 1: Get AI decision
    const aiMsg = await chain.invoke([{
        role: "user",
        content: userInput,
    }]);
    
    // Step 2: Manually check which tool was called
    if (aiMsg.tool_calls && aiMsg.tool_calls.length > 0) {
        const toolCall = aiMsg.tool_calls[0];
        
        // Step 3: Execute appropriate tool
        if (toolCall.name === "multiply") {
            toolMsgs = [await multiply.invoke(toolCall)];
        } else if (toolCall.name === "tavily") {
            toolMsgs = await tavilyTool.batch([toolCall]);
        }
        // ... other tools
    }
    
    // Step 4: Send tool results back to LLM
    const chainResult = await chain.invoke([
        { role: "user", content: userInput },
        aiMsg,
        ...toolMsgs,
    ]);
    
    return chainResult;
});
```

#### **Tool Implementations:**

##### **1. 🔢 `multiply` - Math Tool**
```typescript
const multiply = tool(
    ({ a, b }: { a: number; b: number }): number => {
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
```
**Use Case:** `"What is 25 multiplied by 4?"` → Returns `100`

##### **2. 🌐 `tavilyTool` - Web Search**
```typescript
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
```
**Use Case:** `"What's the latest news about AI?"` → Returns real-time search results

##### **3. 🌐 `visitWbsiteTool` - Website Analyzer**
```typescript
const visitWbsiteTool = tool(
    async ({ query }) => {
        const result = await chatGroq.invoke([{
            "role": "user",
            "content": query,
        }]);
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
```
**Use Case:** `"What's on example.com?"` → Fetches and analyzes content

##### **4. 🔊 `textToSpeech` - TTS with Groq PlayAI**
```typescript
const textToSpeech = tool(
    async ({ text, voice = "Arista-PlayAI", model = "playai-tts", response_format = "wav" }) => {
        // 1. Call Groq TTS API
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
        
        // 2. Generate smart filename using AI
        const title = await titleORFileNameGenrate(text, 'fileName');
        
        // 3. Save audio file
        const speechFile = path.resolve(`./genAudio/${title.content}.wav`);
        const buffer = Buffer.from(await response.arrayBuffer());
        await fs.promises.writeFile(speechFile, buffer);
        
        return {
            success: true,
            message: "Speech generated successfully",
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
            voice: z.string().optional().default("Fritz-PlayAI"),
            model: z.string().optional().default("playai-tts"),
            response_format: z.enum(["wav", "mp3", "flac"]).optional().default("wav")
        }),
    }
);
```
**Features:**
- Groq PlayAI TTS integration
- Multiple voice options
- Format selection (wav, mp3, flac)
- AI-generated filenames
- Saves to `./genAudio/` directory

**Use Case:** `"Convert 'Hello World' to speech"` → Creates `hello-world.wav`

##### **5. 🎨 `generateImage` - FLUX Image Generation**
```typescript
const generateImage = tool(
    async ({ prompt }) => {
        // 1. Connect to Gradio FLUX Unlimited space
        const { Client } = await import("@gradio/client");
        const client = await Client.connect('NihalGazi/FLUX-Unlimited')
        
        // 2. Generate image
        const result = await client.predict("/generate_image", {
            prompt: prompt,
            width: 512,
            height: 512,
            seed: 3,
            randomize: true,
            server_choice: "Google US Server"
        });
        
        // 3. Download image
        const imageUrl = result.data[0].url;
        const imageResponse = await fetch(imageUrl);
        const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
        
        // 4. Generate smart filename
        const title = await titleORFileNameGenrate(prompt, 'fileName');
        
        // 5. Save image
        const imagePath = path.resolve(`./genImage/${title.content}.png`);
        await fs.promises.writeFile(imagePath, imageBuffer);
        
        return {
            success: true,
            message: "Image generated successfully using FLUX Unlimited",
            filePath: imagePath,
            prompt: prompt,
        }
    }, 
    {
        name: "generateImage",
        description: "Use for generating images.",
        schema: z.object({
            prompt: z.string().describe("The text prompt to generate the image from"),
        }),
    }
)
```
**Features:**
- FLUX Unlimited model via Gradio
- 512x512 resolution
- Random seed for variety
- AI-generated filenames
- Saves to `./genImage/` directory

**Use Case:** `"Generate an image of a sunset over mountains"` → Creates `sunset-mountains.png`

##### **6. 🎤 `speechToText` - Whisper v3 Transcription**
```typescript
const speechToText = tool(
    async ({ filePath, language, prompt }) => {
        const transcription = await groq.audio.transcriptions.create({
            file: fs.createReadStream(filePath),
            model: "whisper-large-v3",
            prompt: prompt || "Specify context or spelling",
            response_format: "verbose_json",
            timestamp_granularities: ["word", "segment"],
            language: language,
            temperature: 0.0,
        });
        
        return {
            success: true,
            message: "Audio transcribed successfully.",
            text: transcription.text,
            language: language || "en",
            model: "whisper-large-v3-turbo",
            format: "verbose_json"
        }
    }, 
    {
        name: "speechToText",
        description: "Convert speech to text any language.",
        schema: z.object({
            filePath: z.string().describe("Path to the audio file to transcribe"),
            language: z.string().optional().describe("Language of the audio (ISO 639-1 format)"),
            prompt: z.string().optional().default("Specify context or spelling"),
            temperature: z.number().min(0).max(1).optional(),
            response_format: z.enum(["json", "text", "srt", "verbose_json"]).optional()
        })
    }
)
```
**Features:**
- Groq Whisper Large v3 model
- Multi-language support
- Timestamp granularities (word & segment level)
- Context/spelling hints via prompt
- Verbose JSON output with metadata

**Use Case:** `"Transcribe audio.mp3"` → Returns transcribed text with timestamps

#### **🔧 Smart Filename Generation:**

```typescript
async function titleORFileNameGenrate(query: string, titleType: String) {
    const prompt = ChatPromptTemplate.fromMessages([
        ["system", `You are an expert ${titleType} generator AI...`],
        ["user", "Generate a ${titleType} for this query: {query}"]
    ]);
    const chain = prompt.pipe(llm);
    const chainResult = await chain.invoke({ query, titleType });
    return chainResult;
}
```

**Examples:**
- Input: `"hello world speech"` → Filename: `hello-world-speech`
- Input: `"sunset over mountains"` → Filename: `sunset-mountains`
- Uses snake_case or kebab-case
- No spaces or special characters
- SEO-friendly and descriptive

---

### 🆚 **`langraph.ts` vs `tools.ts` Comparison**

| Feature | **langraph.ts** | **tools.ts** |
|---------|----------------|-------------|
| **Architecture** | State graph with nodes/edges | Manual tool orchestration |
| **Routing** | Automatic via `shouldContinue` | Manual if/else checks |
| **State Management** | Built-in with `StateGraph` | Manual state handling |
| **Memory** | `MemorySaver` checkpointing | No built-in memory |
| **Loops** | Cyclical (tools → agent → tools) | Linear execution |
| **Complexity** | Lower - framework handles flow | Higher - manual control |
| **Best For** | Complex multi-turn agents | Simple tool calling demos |
| **Scalability** | High - easy to add nodes | Medium - requires code changes |
| **Debugging** | Built-in tracing | Custom logging |
| **Type Safety** | Strong typing | Strong typing |

---

### 🎯 **When to Use Which?**

#### Use **`langraph.ts`** when:
✅ Building production agents with memory  
✅ Need cyclical tool calling (agent → tool → agent)  
✅ Want automatic routing logic  
✅ Require conversation history/context  
✅ Building complex multi-step workflows  

#### Use **`tools.ts`** when:
✅ Learning tool calling basics  
✅ Prototyping quick demos  
✅ Need full manual control  
✅ Simple one-shot tool calls  
✅ Custom orchestration logic required  

---

## 🔧 Configuration

## 🛠️ Examples

### 1. Tool Calling - Multiplication
Execute math calculations through AI:
```bash
User: "What is 3 multiplied by 4?"
AI: Calls multiply tool → Returns 12
```

### 2. Web Search with Tavily
Search the web for real-time information:
```bash
User: "What's the weather in Surat, India?"
AI: Calls Tavily tool → Returns current weather data
```

### 3. Text-to-Speech
Convert text to audio using Groq's PlayAI:
```bash
User: "Convert 'Hello World' to speech"
AI: Calls textToSpeech tool → Saves hello-world.wav
```

### 4. Image Generation
Create images using FLUX Unlimited:
```bash
User: "Generate an image of a baby"
AI: Calls generateImage tool → Saves baby-portrait.png
```

### 5. Website Content Fetching
Visit and extract content from websites:
```bash
User: "What's on example.com?"
AI: Calls visitWebsite tool → Returns page content
```

### 6. Runnable Chains
Chain multiple operations:
```typescript
const chain = RunnableSequence.from([uppercase, addExclamation, reverse]);
const result = await chain.invoke("hello"); // "OLLEH!"
```

### 7. Structured Output
Get typed responses with validation:
```typescript
const schema = z.object({
    value_of_x: z.string()
});
const structuredLLM = chat.withStructuredOutput(schema);
```

## 🎯 Key Features Explained

### Smart File Naming
All generated files (audio, images) are automatically named using AI:
- Audio: `hello-world-speech.wav`
- Images: `baby-portrait.png`

### Tool Integration
The AI automatically decides which tool to use based on your query:
- Math questions → Multiply tool
- Weather/news → Web search
- Audio requests → Text-to-speech
- Image requests → Image generation

### Error Handling
All tools include comprehensive error handling and return structured responses with success status.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👤 Author

**Ankit Singh**
- GitHub: [@ankitsingh7777903679](https://github.com/ankitsingh7777903679)

## 🙏 Acknowledgments

- [LangChain](https://www.langchain.com/) for the AI framework
- [OpenAI](https://openai.com/) for GPT-4o-mini model
- [Groq](https://groq.com/) for PlayAI text-to-speech
- [Tavily](https://tavily.com/) for web search API
- [FLUX Unlimited](https://huggingface.co/spaces/NihalGazi/FLUX-Unlimited) for image generation
- [Zod](https://zod.dev/) for schema validation
- [@gradio/client](https://www.gradio.app/) for Gradio API integration
- Inspired by Google's NotebookLM

## 📞 Support

For support, please open an issue in the GitHub repository.

## 🔗 Related Resources

- [LangChain Documentation](https://js.langchain.com/docs/)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Groq Documentation](https://console.groq.com/docs)
- [Tavily API Docs](https://docs.tavily.com/)

---

Made with ❤️ by Ankit Singh
