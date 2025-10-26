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
│   ├── tools.ts          # AI tools: TTS, image gen, web search, math
│   ├── runnable.ts       # Runnable chains and sequences
│   └── server.ts         # Express server setup
├── dist/                 # Compiled JavaScript output
├── tsconfig.json         # TypeScript configuration
├── package.json          # Project dependencies
├── .env                  # Environment variables (not in repo)
└── generated files/      # Output: images, audio files
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
