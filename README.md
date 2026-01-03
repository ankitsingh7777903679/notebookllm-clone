# NotebookLM Clone

A TypeScript-based AI toolkit leveraging LangChain, OpenAI's GPT models, and Groq for intelligent document analysis, conversational AI, text-to-speech, and image generation capabilities.

## 🚀 Features

### **Self-Correcting RAG (Retrieval-Augmented Generation)**
- ✅ **Query Expansion**: Automatically expands user questions into 5 diverse search queries
- ✅ **Reciprocal Rank Fusion**: Intelligent document ranking from multiple retrievals
- ✅ **Document Grading**: LLM-based relevance filtering for retrieved documents
- ✅ **Conditional Routing**: Smart path selection based on document quality
- ✅ **Query Transformation**: Automatic query improvement for better results
- ✅ **Web Search Fallback**: Tavily search integration when vector DB lacks relevant docs
- ✅ **LangGraph State Management**: Advanced workflow orchestration with StateAnnotation
- ✅ **Zero Hallucination**: Always grounds answers in retrieved context

### **Map-Reduce Document Summarization**
- ✅ **Parallel Processing**: Fork pattern for concurrent document summarization
- ✅ **Hierarchical Reduction**: Automatically collapses summaries into final output
- ✅ **Web Scraping**: Load and summarize web pages with Cheerio
- ✅ **Token-Aware**: Smart chunking to stay within API limits
- ✅ **Recursive Collapse**: Multi-level summary reduction for large documents
- ✅ **LangGraph Orchestration**: State-based workflow with conditional routing

### **AI-Powered Chat & Tools**
- **AI-Powered Chat**: Interact with documents using OpenAI's GPT-4o-mini model
- **Tool Calling**: Execute functions and APIs through AI
  - ✅ **Multiplication**: Perform math calculations
  - ✅ **Web Search**: Real-time search using Tavily API
  - ✅ **Website Visitor**: Fetch and analyze web content
  - ✅ **Text-to-Speech**: Convert text to audio using Groq's PlayAI TTS
  - ✅ **Image Generation**: Create images using FLUX Unlimited model

### **Email Agent with Human-in-the-Loop**
- ✅ **Email Management**: List and retrieve emails with LangGraph
- ✅ **Human Approval**: Middleware for agent action approval
- ✅ **Memory Persistence**: MemorySaver for conversation context

### **Infrastructure**
- **LangChain Integration**: Built with LangChain v1.0+ for robust AI workflows
- **LangGraph**: State-based workflow orchestration
- **Runnable Chains**: Chain multiple operations together
- **Structured Output**: Get typed responses with Zod schemas
- **TypeScript**: Fully typed for better development experience
- **Vector Database**: Pinecone integration with Cohere embeddings
- **Smart File Naming**: AI-generated filenames for outputs

## � Documentation & Guide Structure

For a detailed explanation of how the workflows, functions, inputs, and outputs work, please refer to the **[DOCUMENTATION.md](DOCUMENTATION.md)** file.

It covers:
- **Ingestion Pipeline**: How documents are processed and stored.
- **Summarization & Study Guides**: The Map-Reduce algorithms used for content generation.
- **Mind Maps**: How text is converted into visual structures.
- **QA & RAG**: The retrieval-augmented generation flow.
- **API Endpoints**: How to interact with the backend services.

## �📋 Prerequisites

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
PINECONE_API_KEY=your_pinecone_api_key_here
COHERE_API_KEY=your_cohere_api_key_here
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
# Run Self-Correcting RAG system
npm run qa

# Run Map-Reduce Document Summarization
npm run summary

# Run email agent with human-in-the-loop
npm run hil

# Run tool calling examples
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
│   ├── index.ts                # Main entry point with structured output
│   ├── qa-overdoc.ts          # Self-Correcting RAG with LangGraph
│   ├── summary.ts             # Map-Reduce Document Summarization
│   ├── Hil.ts                 # Email agent with human-in-the-loop
│   ├── langraph.ts            # LangGraph agentic workflow
│   ├── tools.ts               # AI tools: TTS, image gen, web search, math
│   ├── runnable.ts            # Runnable chains and sequences
│   ├── tts.ts                 # Text-to-speech utilities
│   ├── util.ts                # Response formatters for JSON parsing
│   ├── prompt/
│   │   └── prompts.ts         # Prompt templates for RAG pipeline
│   ├── lib/
│   │   ├── retriever.ts       # Vector DB retrieval logic
│   │   ├── RRF.ts             # Reciprocal Rank Fusion algorithm
│   │   ├── generator.ts       # Answer generation
│   │   └── ingestion-pipeline.ts  # Document ingestion to Pinecone
├── genAudio/                  # Generated audio files output
├── genImage/                  # Generated image files output
├── dist/                      # Compiled JavaScript output
├── tsconfig.json              # TypeScript configuration
├── package.json               # Project dependencies
├── .env                       # Environment variables (not in repo)
└── README.md                  # This file
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
| `PINECONE_API_KEY` | Pinecone API key for vector database | Yes (for RAG) |
| `COHERE_API_KEY` | Cohere API key for embeddings | Yes (for RAG) |
| `LANGSMITH_API_KEY` | LangSmith API key for tracing | Optional |
| `LANGSMITH_TRACING` | Enable LangSmith tracing (true/false) | Optional |

## 📚 Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `npm run build` | `tsc` | Compile TypeScript to JavaScript |
| `npm start` | `node dist/index.js` | Run the compiled application |
| `npm run watch` | `tsc --watch` | Watch mode with auto-recompile |
| `npm run dev` | `tsc --watch` | Alias for watch mode |
| `npm run qa` | `tsx src/qa-overdoc.ts` | Run Self-Correcting RAG system |
| `npm run summary` | `tsx src/summary.ts` | Run Map-Reduce Document Summarization |
| `npm run hil` | `tsx src/Hil.ts` | Run email agent with human approval |
| `npm run runnable` | `tsx src/tools.ts` | Run tool calling examples |
| `npm run lang` | `tsx src/langraph.ts` | Run LangGraph agentic workflow |

---

## 🧠 Architecture Deep Dive

### � Self-Correcting RAG System (`qa-overdoc.ts`)

**Advanced Retrieval-Augmented Generation with self-correction capabilities**

The Self-Correcting RAG system is a sophisticated question-answering pipeline that ensures high-quality, grounded answers by implementing multiple layers of validation and fallback mechanisms.

#### **System Architecture**

```
User Question
    ↓
┌─────────────────────────────────────────────────────────────┐
│ [RetrieverNode]                                             │
│ • Expand query into 5 diverse questions                     │
│ • Query vector database with each question                  │
│ • Apply Reciprocal Rank Fusion (RRF) to merge results      │
└─────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────┐
│ [gradeDocNode]                                              │
│ • LLM grades each document for relevance                    │
│ • Filter out non-relevant documents                         │
│ • Return only high-quality, relevant context                │
└─────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────┐
│ [Router] - Conditional Decision                             │
│ • Check if filteredDoc is empty?                            │
└─────────────────────────────────────────────────────────────┘
    ↓                              ↓
  YES (no docs)                  NO (has docs)
    ↓                              ↓
┌─────────────────────┐    ┌──────────────────┐
│ [transformQuery]    │    │ [generate]       │
│ • Improve query     │    │ • Generate answer│
│ • Make it specific  │    │ • Use retrieved  │
└─────────────────────┘    │   documents      │
    ↓                      └──────────────────┘
┌─────────────────────┐            ↓
│ [webSearch]         │      Final AI Response
│ • Tavily API search │
│ • Get fresh docs    │
└─────────────────────┘
    ↓
┌─────────────────────┐
│ [generate]          │
│ • Generate answer   │
│ • Use web results   │
└─────────────────────┘
    ↓
Final AI Response
```

#### **Key Components**

##### 1️⃣ **Query Expansion (RetrieverNode)**
- **Problem**: Single questions often miss relevant documents
- **Solution**: Expand 1 question → 5 diverse questions using LLM
- **Example**:
  ```
  Input: "Types of prompt engineering"
  Output:
  - "What are prompt engineering techniques?"
  - "How to design effective AI prompts?"
  - "Different methods for optimizing prompts"
  - "Prompt engineering best practices"
  - "Comparing zero-shot vs few-shot prompting"
  ```

##### 2️⃣ **Reciprocal Rank Fusion (RRF)**
- **Problem**: Multiple searches return overlapping documents with different rankings
- **Solution**: Intelligent fusion algorithm that:
  - Combines rankings from all 5 searches
  - Gives higher scores to documents appearing in multiple results
  - Produces a single, optimized ranking

##### 3️⃣ **LLM-Based Document Grading**
- **Problem**: Vector similarity ≠ semantic relevance
- **Solution**: LLM judges each document:
  ```typescript
  Question: "Types of prompt engineering"
  Document: [content]
  Grade: "relevant" or "not-relevant"
  ```

##### 4️⃣ **Conditional Routing**
- **Decision Point**: Check document quality
  - **Path A**: Has relevant docs → Generate answer immediately
  - **Path B**: No relevant docs → Improve query + Web search

##### 5️⃣ **Query Transformation**
- **Purpose**: Improve vague queries for better web search results
- **Example**:
  ```
  Before: "Types of prompt engineering"
  After: "What are the different techniques and approaches used 
         in prompt engineering for AI models?"
  ```

##### 6️⃣ **Web Search Fallback (Tavily)**
- **Purpose**: Ensure we always have context (prevent "I don't know")
- **When**: Triggered when vector DB has no relevant documents
- **Result**: Fresh, web-sourced documents

##### 7️⃣ **Answer Generation**
- **Input**: Original question + Generated questions + Retrieved documents
- **Process**: LLM synthesizes comprehensive answer
- **Output**: Grounded, citation-ready response

#### **State Management**

```typescript
StateAnnotation = {
  messages: [],           // Conversation history
  retrivedDoc: [],        // Documents from vector DB
  filteredDoc: [],        // Relevant documents after grading
  newQuery: "",           // Transformed query for web search
  generateQuestion: [],   // 5 expanded questions
  currentNode: "",        // Track workflow position
  nextNode: ""            // Control flow routing
}
```

#### **Benefits**

✅ **Zero Hallucination**: Always grounds answers in retrieved context  
✅ **High Recall**: Query expansion catches more relevant documents  
✅ **High Precision**: Document grading filters noise  
✅ **Adaptive**: Routes to web search when needed  
✅ **Self-Correcting**: Improves queries that don't work  
✅ **Traceable**: Full state visibility for debugging  

#### **Usage**

```bash
npm run qa
```

**Example Output**:
```
start RetrieverNode...
RetrieverNode...
gradeDocNode...
 --- TRANSFORM QUERY ---
transformQuery... What are the different techniques and approaches...
webSearch...
generate...

=== AI Response ===
### Types of Prompt Engineering

1. **In-Context Prompting**: Providing examples within the prompt...
2. **Few-Shot Prompting**: Giving model a few examples to learn from...
3. **Chain-of-Thought**: Breaking down reasoning into steps...
...
```

---

### �📂 `langraph.ts` - LangGraph Agentic Workflow

**What is LangGraph?**

LangGraph is a state management framework for building stateful, multi-actor applications with LLMs. It extends LangChain with the ability to create cyclical graphs, perfect for building agents that can:
- Make decisions
- Call tools
- Loop back with results
- Maintain conversation memory

#### **How `langraph.ts` Works**

```typescript
```

---

### 📝 Map-Reduce Document Summarization (`summary.ts`)

**Parallel Document Summarization with Hierarchical Reduction**

The Map-Reduce Summarization system uses LangGraph's fork pattern to efficiently summarize large documents by processing chunks in parallel and then recursively merging the results.

#### **System Architecture**

```
Input: 15 Document Chunks
         ↓
    [__start__]
         ↓
    [mapSummaries] ← FORK: Split into parallel tasks
         ↓
    ┌────┴────┬────┬────┬─────┬─────┬────────┬─────┐
    ↓         ↓    ↓    ↓     ↓     ↓        ↓     ↓
[genSum1] [genSum2] ... [genSum15]  ← 15 parallel LLM calls
    ↓         ↓    ↓    ↓     ↓     ↓        ↓     ↓
    └────┬────┴────┴────┴─────┴─────┴────────┴─────┘
         ↓
  [collectSummaries] ← JOIN: Merge results
         ↓
  [shouldCollapse?] ← Check total token count
         ↓
    ┌────┴────┐
    ↓         ↓
  YES (>1000) NO (≤1000)
    ↓         ↓
[collapse]  [finalSummary]
    ↓         ↓
  Loop ←      │
    └─────────┴──→ [__end__]
```

#### **Key Components**

##### 1️⃣ **Document Loading & Chunking**

```typescript
// Load web page
const loader = new CheerioWebBaseLoader(
  'https://lilianweng.github.io/posts/2023-03-15-prompt-engineering'
);
const docs = await loader.load();

// Split into chunks
const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
});
const allSplitDocs = await textSplitter.splitDocuments(docs);
const splitDocs = allSplitDocs.slice(0, 15); // Process first 15 chunks
```

**Result**: 15 manageable document chunks from a large web page

##### 2️⃣ **Fork Pattern - Parallel Summarization**

```typescript
const mapSummaries = (state: typeof OverallState.State) => {
    // Create a Send object for each document chunk
    return state.contents.map(
        (content) => new Send("generateSummary", { content })
    );
};
```

**What happens:**
- Takes 15 document chunks
- Creates 15 parallel execution tasks
- Each task processes one chunk independently
- **This is the FORK!** 1 → 15 parallel nodes

##### 3️⃣ **Parallel LLM Calls**

```typescript
const generateSummary = async (state: SummaryState) => {
    const mapPrompt = ChatPromptTemplate.fromMessages([
        ["user", "Write a concise summary of the following: \n\n{context}"],
    ]);
    const prompt = await mapPrompt.invoke({ context: state.content });
    
    // LLM call for this chunk
    const response = await llm.invoke(prompt);
    return { summaries: [String(response.content)] };
}
```

**Result**: 15 summaries generated in parallel
- Doc1 (1000 chars) → Summary1 (200 chars)
- Doc2 (1000 chars) → Summary2 (200 chars)
- ...
- Doc15 (1000 chars) → Summary15 (200 chars)

##### 4️⃣ **Collect & Join Results**

```typescript
const collectSummaries = async (state: typeof OverallState.State) => {
    return {
        collapsedSummaries: state.summaries.map(
            (summary) => new Document({ pageContent: summary })
        ),
    };
};
```

**Result**: All 15 parallel summaries merged back into one array

##### 5️⃣ **Conditional Collapse Decision**

```typescript
async function shouldCollapse(state: typeof OverallState.State) {
    let numTokens = await lengthFunction(state.collapsedSummaries);
    if (numTokens > tokenMax) {  // tokenMax = 1000
        return "collapseSummaries";  // Still too big, reduce more
    } else {
        return "generateFinalSummary";  // Small enough, finalize
    }
}
```

**Decision Logic:**
- Count total tokens in all summaries
- **If > 1000 tokens**: Need further reduction → `collapseSummaries`
- **If ≤ 1000 tokens**: Ready for final summary → `generateFinalSummary`

##### 6️⃣ **Hierarchical Reduction**

```typescript
const collapseSummaries = async (state: typeof OverallState.State) => {
    // Split summaries into groups of ~1000 tokens each
    const docLists = splitListOfDocs(
        state.collapsedSummaries,
        lengthFunction,
        tokenMax
    );
    
    // Merge each group
    const results = [];
    for (const docList of docLists) {
        results.push(await collapseDocs(docList, _reduce));
    }
    return { collapsedSummaries: results };
};

async function _reduce(input: any): Promise<string> {
    const reducePrompt = ChatPromptTemplate.fromMessages([
        ["user", `Take these summaries and distill into a final summary: {docs}`]
    ]);
    const response = await llm.invoke(await reducePrompt.invoke({ docs: input }));
    return String(response.content);
}
```

**What happens:**
- 15 summaries → Split into 3 groups of 5
- **3 LLM calls** to merge each group
- Result: 3 merged summaries
- **Loops back** to `shouldCollapse`
- Repeats until small enough

##### 7️⃣ **Final Summary Generation**

```typescript
const generateFinalSummary = async (state: typeof OverallState.State) => {
    const response = await _reduce(state.collapsedSummaries);
    return { finalSummary: response };
};
```

**Result**: One comprehensive final summary of the entire document

#### **Complete LLM Call Flow**

```
Example with 15 chunks:

1. Fork Phase:
   └─ 15 parallel generateSummary calls
   
2. Reduce Phase (if needed):
   └─ 15 summaries split into 3 groups
   └─ 3 collapse LLM calls → 3 merged summaries
   └─ Check again: still > 1000 tokens?
      └─ If YES: 1 more collapse call → 1 summary
      └─ If NO: proceed to final
   
3. Final Phase:
   └─ 1 generateFinalSummary call

Total: 15 + 3 + 1 = 19 LLM calls
```

#### **State Management**

```typescript
const OverallState = Annotation.Root({
    contents: Annotation<string[]>,        // Original document chunks
    summaries: Annotation<string[]>({      // Individual summaries
        reducer: (state, update) => state.concat(update),  // Accumulate
    }),
    collapsedSummaries: Annotation<Document[]>,  // Merged summaries
    finalSummary: Annotation<string>,            // Final output
});
```

#### **Benefits**

✅ **Parallel Processing**: 15 chunks summarized simultaneously (faster)  
✅ **Token Efficiency**: No single request exceeds API limits  
✅ **Hierarchical Quality**: Multiple reduction passes improve synthesis  
✅ **Scalable**: Works with 10 or 1000+ document chunks  
✅ **Automatic Adaptation**: Recursively reduces until size is optimal  
✅ **Web Integration**: Direct web page scraping with Cheerio  

#### **Usage**

```bash
npm run summary
```

**Example Output:**
```
[ 'generateSummary' ]  ← 15 times (parallel)
[ 'collectSummaries' ]
[ 'collapseSummaries' ]  ← If needed
[ 'generateFinalSummary' ]

Final sum: {
  finalSummary: "This document explores prompt engineering techniques 
  including zero-shot, few-shot, and chain-of-thought prompting..."
}
```

#### **Configuration Options**

```typescript
// Adjust chunk size
const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,      // Characters per chunk
    chunkOverlap: 200,    // Overlap between chunks
});

// Limit number of chunks processed
const splitDocs = allSplitDocs.slice(0, 15);  // Process first 15

// Adjust collapse threshold
let tokenMax = 1000;  // Collapse if summaries > 1000 tokens
```

---

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

### � Email Agent with Human-in-the-Loop (`Hil.ts`)

**Intelligent Email Management with Manual Approval**

The Email Agent demonstrates a critical safety pattern in AI systems: **human-in-the-loop** (HIL) approval before executing sensitive actions.

#### **Architecture**

```
User Request
    ↓
┌─────────────────────────────────────────┐
│ [Agent Node]                            │
│ • LLM analyzes request                  │
│ • Decides which tool to call            │
│ • Returns tool call(s)                  │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ [Human Approval Middleware]             │
│ • Display tool call details             │
│ • Ask: "Approve this action? (y/n)"     │
│ • User types 'y' or 'n'                 │
└─────────────────────────────────────────┘
    ↓
  Approved?
    ↓              ↓
   YES            NO
    ↓              ↓
┌──────────┐  ┌─────────────────┐
│ [Tools]  │  │ Action cancelled│
│ Execute  │  └─────────────────┘
└──────────┘
    ↓
Return Results
```

#### **Key Components**

##### 1️⃣ **Email Tools**

```typescript
const getEmail = tool(
  async ({ emailId }) => {
    // Retrieve specific email by ID
    const email = dummyEmails.find(e => e.id === emailId);
    return JSON.stringify(email, null, 2);
  },
  {
    name: "getEmail",
    description: "Get a specific email by ID",
    schema: z.object({ emailId: z.string() })
  }
);

const listEmails = tool(
  async () => {
    // List all available emails
    return JSON.stringify(dummyEmails, null, 2);
  },
  {
    name: "listEmails",
    description: "List all emails"
  }
);
```

##### 2️⃣ **Dummy Data**

```typescript
const dummyEmails = [
  { id: "1", from: "john.doe@example.com", subject: "Refund Request", body: "I'd like a refund..." },
  { id: "2", from: "sarah.smith@example.com", subject: "Product Inquiry", body: "What's the price..." },
  { id: "3", from: "mike.johnson@example.com", subject: "Feedback", body: "Great service!" },
  { id: "4", from: "emma.wilson@example.com", subject: "Technical Issue", body: "App crashes..." },
  { id: "5", from: "david.brown@example.com", subject: "Bulk Purchase", body: "Discount available?" }
];
```

##### 3️⃣ **Human-in-the-Loop Middleware**

```typescript
const humanApprovalMiddleware: StepInterrupt = async (step) => {
  if (step.action === 'tool-call') {
    console.log("\n🤖 Agent wants to call tool:");
    console.log(`Tool: ${step.toolCall.name}`);
    console.log(`Args: ${JSON.stringify(step.toolCall.args)}`);
    
    // Ask for approval
    const approved = await getUserApproval();
    
    if (!approved) {
      throw new Error("Action cancelled by user");
    }
  }
};
```

##### 4️⃣ **LangGraph State Machine**

```typescript
const workflow = new StateGraph(MessagesAnnotation)
  .addNode("agent", callModel)
  .addNode("tools", toolNode)
  .addEdge(START, "agent")
  .addConditionalEdges("agent", shouldContinue)
  .addEdge("tools", "agent");

const app = workflow.compile({
  checkpointer: new MemorySaver(),
  interruptBefore: ["tools"]  // Pause before tool execution
});
```

#### **Workflow Example**

```bash
npm run hil
```

**Interaction:**
```
User: "List all emails"

🤖 Agent wants to call tool:
Tool: listEmails
Args: {}

⚠️  Approve this action? (y/n): y

✅ Approved! Executing...

Result:
[
  { id: "1", from: "john.doe@example.com", subject: "Refund Request" },
  { id: "2", from: "sarah.smith@example.com", subject: "Product Inquiry" },
  ...
]

---

User: "Get email 3"

🤖 Agent wants to call tool:
Tool: getEmail
Args: { emailId: "3" }

⚠️  Approve this action? (y/n): n

❌ Action cancelled by user
```

#### **Benefits**

✅ **Safety First**: Prevents unintended actions  
✅ **Transparency**: Shows exactly what agent wants to do  
✅ **User Control**: Human can approve/reject each action  
✅ **Audit Trail**: Log of all approval decisions  
✅ **Flexible**: Can implement complex approval logic  
✅ **Production-Ready**: Critical for sensitive operations (email, payments, data deletion)  

#### **Use Cases**

- 📧 Email management (sending, deleting, forwarding)
- 💰 Financial transactions
- 🗑️ Data deletion operations
- 🔐 Permission changes
- 📝 Contract signing
- 🚀 Deployment actions

---

### �📂 `tools.ts` - AI Tool Collection & Manual Orchestration

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
- [LangGraph](https://langchain-ai.github.io/langgraph/) for state-based workflows
- [OpenAI](https://openai.com/) for GPT-4o-mini model
- [Groq](https://groq.com/) for PlayAI text-to-speech
- [Tavily](https://tavily.com/) for web search API
- [Pinecone](https://www.pinecone.io/) for vector database
- [Cohere](https://cohere.com/) for embeddings
- [FLUX Unlimited](https://huggingface.co/spaces/NihalGazi/FLUX-Unlimited) for image generation
- [Zod](https://zod.dev/) for schema validation
- [@gradio/client](https://www.gradio.app/) for Gradio API integration
- Inspired by Google's NotebookLM

## 📞 Support

For support, please open an issue in the GitHub repository.

## 🔗 Related Resources

- [LangChain Documentation](https://js.langchain.com/docs/)
- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Groq Documentation](https://console.groq.com/docs)
- [Tavily API Docs](https://docs.tavily.com/)
- [Pinecone Documentation](https://docs.pinecone.io/)
- [Cohere API Reference](https://docs.cohere.com/)

---

## 🚀 Quick Start Guide

### Run Self-Correcting RAG
```bash
npm run qa
```
Ask questions and get grounded, hallucination-free answers!

### Run Map-Reduce Document Summarization
```bash
npm run summary
```
Summarize large web pages with parallel processing and hierarchical reduction!

### Run Email Agent with Human Approval
```bash
npm run hil
```
Interact with emails with manual approval for each action.

### Run Tool-Calling Agent
```bash
npm run lang
```
Multi-turn conversations with automatic tool routing.

### Explore Individual Tools
```bash
npm run runnable
```
Test individual AI tools (TTS, image generation, web search).

---

**Built with ❤️ using LangChain, LangGraph, and TypeScript**

---

Made with ❤️ by Ankit Singh
