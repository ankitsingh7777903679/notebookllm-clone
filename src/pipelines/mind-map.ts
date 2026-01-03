import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { PromptTemplate, ChatPromptTemplate } from '@langchain/core/prompts'
import z, { Schema } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import { ChatOpenAI } from "@langchain/openai";
// MindElixir is browser-only - import removed to avoid "document is not defined" error
// The server generates JSON data; the client renders it with MindElixir
import "dotenv/config"
import { Runnable } from "@langchain/core/runnables";





export async function generateMindMap<T extends Runnable>(llm: T, studyGuide: string) {

    const MindElixirNode = z.object({
        id: z.string(),
        topic: z.string(),
        // Instead of recursive reference, allow children with samestructure but only.1
        children: z
            .array(
                z.object({
                    id: z.string(),
                    topic: z.string(),
                    children: z.array(
                        z.object({
                            id: z.string(),
                            topic: z.string(),
                            // stop recursion here
                            children: z.array(z.any()).optional(),
                        })
                    ).optional(),



                })
            )
            .optional(),

    });

    const MindElixirData = z.object({   
        nodeData: MindElixirNode,
    })

    const llms = new ChatOpenAI({
        model: 'gpt-5-mini',
        temperature: 0.7,
        apiKey: process.env.OPENAI_API_KEY,
        configuration: {
            baseURL: process.env.OPENAI_API_BASE_URL,
        }
    });

    const prompt = PromptTemplate.fromTemplate(`
You are an expert level tutor in the education department. Your task is to create a **Mind Map** that enhances students' understanding and retention of complex concepts. The Mind Map should be visually appealing, organized, and comprehensive. Accuracy, clarity, and relevance are core success factors.

**Follow these rules strictly:**

1. Begin by asking the user up to 5 pertinent questions to gather essential specifics for personalization. Include details about learning objectives, difficulty level, preferred format, etc.

2. Take a step back and think about the task thoroughly. Consider success factors, evaluation criteria, and the overall structure before generating the Mind Map.

3. Use the user's details and key references to craft the Mind Map based on the provided study guide content.

4. Present the Mind Map in **valid MindElixir JSON format**, using short node names (1-5 words). Move long explanations or detailed content to node descriptions or separate fields if needed.

5. Include core Prompt Engineering techniques if relevant (Zero-Shot, Few-Shot, Chain-of-Thought, Tree-of-Thought, etc.) as nodes when applicable to the topic.

6. After generating the Mind Map, **evaluate your work** using a table with: Criteria, Rating (1-10), Reasons for Rating, and Suggestions for Improvement.

7. Provide **post-evaluation options** for refining the Mind Map, such as:
   - Add more depth to specific branches
   - Simplify complex nodes
   - Reorganize hierarchy
   - Add cross-references between related concepts

8. Append a **CHANGE LOG 📋** section for any revisions made during the process.

9. Always conclude with: "🤖 Would You Like Me To Evaluate This Work 👍 and Provide Options to Improve It? Yes or No"

10. Ensure the structure matches MindElixir format:
    - Root node with "nodeData" object
    - Each node has: "id" (unique string), "topic" (short name), "children" (array, optional)
    - Support recursive subtopics up to 3 levels deep
    - Use descriptive but concise topic names

11. Do not include any text outside JSON - output pure JSON only.

**MindElixir JSON Format:**

o=open curly brace
c=close curly brace

o
  "nodeData": o
    "id": "root",
    "topic": "<Main Topic>",
    "children": [
      o
        "id": "<unique_id>",
        "topic": "<Short Node Name>",
        "children": [ ... recursive subtopics ... ]
      c
    ]
  c
c

**Key References:**
- Tony Buzan, "The Mind Map Book" (2003)
- Peter C. Brown et al., "Make It Stick" (2014)
- Amy E. Herman, "Visual Intelligence" (2016)

**Study Guide:**
"""
{study_guid_text}
"""

Output the Mind Map as JSON only, fully compatible with MindElixir.
`)


    const chain = prompt.pipe(llms)

    const chainResult = await chain.invoke(
        {
            study_guid_text: studyGuide
            //  {
            //     // study_guid_text:
            // //  ` Study Guide – Three Core Web‑Tech Topics\n` +
            // //     '\n' +
            // //     '> **Goal:** Quickly master how to persist user‑theme preferences, configure MathJax for math rendering, and design effective prompts for large‑language models (LLMs).\n' +
            // //     '\n' +
            // //     '---\n' +
            // //     '\n' +
            // //     '## 1.  LocalStorage & Theme Preference\n' +
            // //     '\n' +
            // //     '| **Key Concept** | **Definition** | **Example** | **Why It Matters** |\n' +
            // //     '|-----------------|----------------|-------------|-------------------|\n' +
            // //     "| `localStorage`  | Browser‑level key/value store that survives page reloads and sessions. | `localStorage.setItem('pref-theme', 'dark');` | Keeps user choice across visits. |\n" +
            // //     '| `pref‑theme`    | Custom key storing `"dark"` or `"light"`. | `localStorage.getItem(\'pref-theme\');` | Allows the app to remember the user’s choice. |\n' +
            // //     "| `document.body.classList` | Live list of classes on `<body>`. | `document.body.classList.add('dark');` | Adds/removes theme class without duplication. |\n" +
            // //     "| `window.matchMedia('(prefers-color-scheme: dark)')` | Detects OS/browser dark‑mode preference. | `window.matchMedia('(prefers-color-scheme: dark)').matches` | Fallback when user hasn’t chosen a theme. |\n" +
            // //     '\n' +
            // //     '### Typical Flow\n' +
            // //     '\n' +
            // //     '```js\n' +
            // //     "const pref = localStorage.getItem('pref-theme');\n" +
            // //     '\n' +
            // //     "if (pref === 'dark') {\n" +
            // //     "  document.body.classList.add('dark');\n" +
            // //     "} else if (pref === 'light') {\n" +
            // //     "  document.body.classList.remove('dark');\n" +
            // //     "} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {\n" +
            // //     "  document.body.classList.add('dark');\n" +
            // //     '}\n' +
            // //     '```\n' +
            // //     '\n' +
            // //     '**Order matters** – explicit user preference → system preference → default light.  \n' +
            // //     '**Persist** – call `setItem()` whenever the toggle changes.  \n' +
            // //     '**Graceful fallback** – if `matchMedia` isn’t supported, stay in light mode.  \n' +
            // //     '\n' +
            // //     '### UX & Performance Tips\n' +
            // //     '\n' +
            // //     '- Store the `getItem()` result once per load to avoid repeated look‑ups.  \n' +
            // //     '- A “theme flicker” is avoided when the stored preference is applied before the page paints.  \n' +
            // //     '- Keep the toggle UI simple: a button that writes the new value to `localStorage` and toggles the class.\n' +
            // //     '\n' +
            // //     '---\n' +
            // //     '\n' +
            // //     '## 2.  MathJax Configuration & CSS Hook\n' +
            // //     '\n' +
            // //     '| **Key Concept** | **Definition** | **Example** | **Why It Matters** |\n' +
            // //     '|-----------------|----------------|-------------|-------------------|\n' +
            // //     '| `MathJax` object | Global config that must be defined **before** the MathJax script loads. | `MathJax = { tex: { … }, options: { … } };` | Sets parsing rules for the entire page. |\n' +
            // //     "| `tex.inlineMath` / `tex.displayMath` | Delimiters for inline (`$…$`, `\\(…\\)`) and display (`$$…$$`, `\\[…\\]`) math. | `[['$', '$'], ['\\\\(', '\\\\)']]` | Determines where MathJax will look for math. |\n" +
            // //     '| `processEscapes` | Allows `\\$` to stay literal. | `processEscapes: true` | Useful for code snippets or currency. |\n' +
            // //     '| `processEnvironments` | Recognizes LaTeX environments like `\\begin{equation}`. | `processEnvironments: true` | Enables full LaTeX support. |\n' +
            // //     "| `options.skipHtmlTags` | Tags whose content MathJax skips (e.g., `script`, `style`). | `['script', 'noscript', 'style', 'textarea', 'pre']` | Improves performance by ignoring irrelevant blocks. |\n" +
            // //     "| `window.addEventListener('load', …)` | Runs after the page fully loads. | `window.addEventListener('load', () => { … });` | Ensures MathJax has rendered before we hook CSS. |\n" +
            // //     "| `document.querySelectorAll('mjx-container')` | Finds MathJax output containers. | `document.querySelectorAll('mjx-container')` | These are the `<mjx-container>` elements created by MathJax. |\n" +
            // //     "| `classList.add('has-jax')` | Adds a CSS hook to the parent of each math container. | `el.parentElement.classList.add('has-jax');` | Lets you style elements that contain math. |\n" +
            // //     '\n' +
            // //     '### Configuration Snippet\n' +
            // //     '\n' +
            // //     '```js\n' +
            // //     'MathJax = {\n' +
            // //     '  tex: {\n' +
            // //     "    inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],\n" +
            // //     "    displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']],\n" +
            // //     '    processEscapes: true,\n' +
            // //     '    processEnvironments: true\n' +
            // //     '  },\n' +
            // //     '  options: {\n' +
            // //     "    skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre']\n" +
            // //     '  }\n' +
            // //     '};\n' +
            // //     '```\n' +
            // //     '\n' +
            // //     '### Adding a CSS Hook\n' +
            // //     '\n' +
            // //     '```js\n' +
            // //     "window.addEventListener('load', () => {\n" +
            // //     "  document.querySelectorAll('mjx-container').forEach(el => {\n" +
            // //     "    el.parentElement.classList.add('has-jax');\n" +
            // //     '  });\n' +
            // //     '});\n' +
            // //     '```\n' +
            // //     '\n' +
            // //     '**CSS Example**\n' +
            // //     '\n' +
            // //     '```css\n' +
            // //     '.has-jax { background:#f9f9f9; padding:0.5em; }\n' +
            // //     '```\n' +
            // //     '\n' +
            // //     '---\n' +
            // //     '\n' +
            // //     '## 3.  Prompt Engineering Basics\n' +
            // //     '\n' +
            // //     '| **Concept** | **Definition** | **Example** | **When to Use** |\n' +
            // //     '|-------------|----------------|-------------|-----------------|\n' +
            // //     '| **Prompt** | Text (or multimodal input) given to an LLM. | `"Write a 150‑word summary of the novel *1984*."` | All interactions. |\n' +
            // //     '| **Zero‑shot** | No examples; rely on the model’s pre‑training. | `Q: Translate to French: "I love coffee." A:` | Common tasks, tight token budgets. |\n' +
            // //     '| **Few‑shot** | 1–5 labeled examples before the new query. | `Q: 2+2? A: 4` → New query. | Niche or ambiguous tasks. |\n' +
            // //     '| **Chain‑of‑Thought (CoT)** | Prompt the model to produce intermediate reasoning steps. | `"Solve 23 × 47. First, break it down step‑by‑step."` | Math/logic problems. |\n' +
            // //     '| **Instruction Prompt** | Clear imperative + desired output format. | `Instruction: Extract dates and locations from the text and output JSON.` | When format matters. |\n' +
            // //     '| **Self‑Consistency** | Sample many completions, then aggregate (majority vote, average). | Generate 10 samples, pick the most frequent answer. | Reduces variance, increases confidence. |\n' +
            // //     '| **Prompt Injection** | Malicious alteration that changes model behavior. | Adding `"Ignore previous instructions"` to a user query. | Guardrails required. |\n' +
            // //     '| **Hallucination** | Plausible but factually incorrect content. | Claiming “the Eiffel Tower is in Berlin.” | Verify outputs, especially factual tasks. |\n' +
            // //     '| **Safety Guardrails** | Constraints (system prompts, filters) to prevent harmful output. | System prompt: “You are a helpful, respectful assistant.” | Essential for production. |\n' +
            // //     '\n' +
            // //     '### Few‑Shot Prompt Construction Tips\n' +
            // //     '\n' +
            // //     '- **Representativeness**: Include diverse, edge‑case examples.  \n' +
            // //     '- **Clarity**: Use unambiguous labels and consistent formatting.  \n' +
            // //     '- **Balance**: Equal number of each class for classification tasks.  \n' +
            // //     '- **Minimalism**: Keep examples concise to stay within token limits.  \n' +
            // //     '- **Ordering**: Simple → complex or general → specific; edge cases near the end.\n' +
            // //     '\n' +
            // //     '### Self‑Consistency Workflow\n' +
            // //     '\n' +
            // //     '1. Prompt the model (zero‑shot, few‑shot, or instruction).  \n' +
            // //     '2. Generate *n* completions (≈5–20, temperature ≈0.7).  \n' +
            // //     '3. Parse each completion.  \n' +
            // //     '4. Aggregate: majority vote for classification, mean for numeric tasks, or pick the most common text.\n' +
            // //     '\n' +
            // //     '### Quick Reference Cheat‑Sheet\n' +
            // //     '\n' +
            // //     '| Technique | Use Case | Core Idea | Prompt Shape |\n' +
            // //     '|-----------|----------|-----------|--------------|\n' +
            // //     '| Zero‑shot | Common tasks, tight token budget | No examples, only instruction | `Instruction → Input → Output:` |\n' +
            // //     '| Few‑shot | Niche/ambiguous tasks | 1–5 labeled examples | `Example 1 … Example N … New Query:` |\n' +
            // //     '| Instruction Prompt | Explicit format required | Direct command + output format | `Instruction: … Input: … Output:` |\n' +
            // //     '| Self‑Consistency | Reasoning‑heavy tasks | Sample many completions, aggregate | Same prompt, run with `n` samples |\n' +
            // //     '\n' +
            // //     '---\n' +
            // //     '\n' +
            // //     '## Bottom‑Line Takeaways\n' +
            // //     '\n' +
            // //     '1. **Theme Persistence**  \n' +
            // //     '   - Store the choice in `localStorage`.  \n' +
            // //     '   - Apply the class based on explicit preference → system preference → default.  \n' +
            // //     "   - Use `classList.add/remove('dark')` for toggling.\n" +
            // //     '\n' +
            // //     '2. **MathJax Setup**  \n' +
            // //     '   - Define `MathJax` config before the script loads.  \n' +
            // //     '   - Set delimiters, escapes, environments, and skip tags.  \n' +
            // //     '   - After load, add a CSS hook (`has‑jax`) to style math containers.\n' +
            // //     '\n' +
            // //     '3. **Prompt Engineering**  \n' +
            // //     '   - Start with a clear instruction; add examples if needed.  \n' +
            // //     '   - Use CoT or self‑consistency for complex reasoning.  \n' +
            // //     '   - Guard against injection/hallucinations with system prompts and post‑processing.\n' +
            // //     '\n' +
            // //     'With this distilled guide, you can confidently implement user‑theme persistence, set up robust math rendering, and craft high‑quality prompts for LLMs in any web project.'

            //  }

        }, {
            response_format: {
                type: "json_object",
                Schema: zodToJsonSchema(MindElixirData),
            }
        } as any

    )

    const result = JSON.parse(chainResult?.content as string)
    const mindMap = (JSON.stringify(result, null, 2));

    // MindElixir initialization removed - this should happen client-side in the browser
    // The server only needs to return the JSON data structure
    // const options: Options = {
    //     el: '#map',
    //     direction: 0,
    // }
    // const mei = new MindElixir(options)
    // mei.init(result)

    return mindMap;
}