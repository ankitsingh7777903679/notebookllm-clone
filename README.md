# NotebookLM Clone

A TypeScript-based clone of Google's NotebookLM, leveraging LangChain and OpenAI's GPT models to provide intelligent document analysis, conversational AI capabilities, and tool calling functionality.

## 🚀 Features

- **AI-Powered Chat**: Interact with documents using OpenAI's GPT models
- **Tool Calling**: Execute functions and APIs through AI (multiplication, web search)
- **LangChain Integration**: Built with LangChain for robust AI workflows
- **Runnable Chains**: Chain multiple operations together
- **Structured Output**: Get typed responses with Zod schemas
- **TypeScript**: Fully typed for better development experience
- **Express Server**: RESTful API for document processing

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key
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
OPENAI_API_BASE_URL=https://api.openai.com/v1
TAVILY_API_KEY=your_tavily_api_key_here
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
│   ├── tools.ts          # Tool calling examples (multiply, web search)
│   ├── runnable.ts       # Runnable chains and sequences
│   └── server.ts         # Express server setup
├── dist/                 # Compiled JavaScript output
├── tsconfig.json         # TypeScript configuration
├── package.json          # Project dependencies
└── .env                  # Environment variables (not in repo)
```

## 🔧 Configuration

### TypeScript Configuration

The project uses the following TypeScript settings:
- **Target**: ES2020
- **Module**: node16
- **Module Resolution**: bundler
- **Strict Mode**: Enabled
- **Source Maps**: Enabled
- **Skip Lib Check**: Enabled

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | Yes |
| `OPENAI_API_BASE_URL` | OpenAI API base URL | Yes |
| `TAVILY_API_KEY` | Tavily API key for web search | Optional |

## 📚 Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `npm run build` | `tsc` | Compile TypeScript to JavaScript |
| `npm start` | `node dist/index.js` | Run the compiled application |
| `npm run watch` | `tsc --watch` | Watch mode with auto-recompile |
| `npm run dev` | `tsc --watch` | Alias for watch mode |
| `npm run runnable` | `tsx src/tools.ts` | Run tool calling examples |

## 🛠️ Examples

### Tool Calling
Execute functions through AI conversation:
```typescript
// AI can call tools like multiplication
"What is 3 multiplied by 4?" → AI calls multiply tool → Returns 12
```

### Web Search
Search the web using Tavily:
```typescript
// AI can search for real-time information
"What's the weather in New York?" → AI calls Tavily tool → Returns search results
```

### Runnable Chains
Chain multiple operations:
```typescript
const chain = RunnableSequence.from([uppercase, addExclamation, reverse]);
const result = await chain.invoke("hello"); // "OLLEH!"
```

### Structured Output
Get typed responses with validation:
```typescript
const schema = z.object({
    value_of_x: z.string()
});
const structuredLLM = chat.withStructuredOutput(schema);
```

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
- [OpenAI](https://openai.com/) for the GPT models
- [Tavily](https://tavily.com/) for web search API
- [Zod](https://zod.dev/) for schema validation
- Inspired by Google's NotebookLM

## 📞 Support

For support, please open an issue in the GitHub repository.
