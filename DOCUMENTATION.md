# NotebookLLM Clone Documentation

This document provides a detailed guide on the workflows, functions, inputs, and outputs of the NotebookLLM Clone project.

## 📚 Workflows & Pipelines

The core logic of the application is contained within the `src/pipelines` directory. Each pipeline is designed to perform a specific task using LangChain and LangGraph.

### 1. Ingestion Pipeline (`src/pipelines/ingestion-pipeline.ts`)

**Function:** `webFileEmbedding(url: string)`

*   **Description:** Scrapes a webpage, splits the content into chunks, generates embeddings using Cohere, and stores them in a Pinecone vector database.
*   **Input:**
    *   `url` (string): The URL of the webpage to ingest.
*   **Output:**
    *   None (void). The result is the side effect of storing vectors in Pinecone.
*   **Process:**
    1.  **Load:** Uses `CheerioWebBaseLoader` to fetch page content.
    2.  **Split:** Uses `RecursiveCharacterTextSplitter` to chunk text (500 chars, 100 overlap).
    3.  **Embed:** Uses `CohereEmbeddings` (model: `embed-english-v3.0`).
    4.  **Store:** Saves vectors to `PineconeStore`.

### 2. Summarization Pipeline (`src/pipelines/summary.ts`)

**Function:** `generateSummary(llm: Runnable, splitDocs: Document[])`

*   **Description:** Generates a concise summary of a list of documents using a Map-Reduce approach.
*   **Input:**
    *   `llm`: The Language Model instance to use.
    *   `splitDocs`: Array of `Document` objects to summarize.
*   **Output:**
    *   `finalSummary` (string): The consolidated summary of all documents.
*   **Process (Map-Reduce):**
    1.  **Map:** Generates individual summaries for each document chunk (`generateSummaryChunk`).
    2.  **Collapse:** If summaries are too large, recursively combines them (`collapseSummaries`).
    3.  **Reduce:** Generates the final summary from the collapsed summaries (`generateFinalSummary`).
    4.  **Graph:** Orchestrated using `StateGraph` from LangGraph.

### 3. Study Guide Pipeline (`src/pipelines/study-guide.ts`)

**Function:** `generateStudyGuide(llm: Runnable, splitDocs: Document[])`

*   **Description:** Creates a structured study guide with key concepts, definitions, and examples.
*   **Input:**
    *   `llm`: The Language Model instance.
    *   `splitDocs`: Array of `Document` objects.
*   **Output:**
    *   `finalStudyGuide` (string): A comprehensive study guide.
*   **Process:**
    *   Similar to Summarization, it uses a Map-Reduce graph.
    *   **Map:** Extracts key concepts and definitions from each chunk.
    *   **Reduce:** Combines these into a cohesive study guide.

### 4. Mind Map Pipeline (`src/pipelines/mind-map.ts`)

**Function:** `generateMindMap(llm: Runnable, studyGuide: string)`

*   **Description:** Converts a study guide into a hierarchical JSON structure suitable for visualization.
*   **Input:**
    *   `llm`: The Language Model instance.
    *   `studyGuide` (string): The text content of the study guide.
*   **Output:**
    *   `mindMap` (JSON string): A JSON string following the MindElixir format.
*   **Process:**
    *   Uses an LLM with a specific prompt to structure the text into a JSON tree.
    *   Validates the output using Zod schema (`MindElixirData`).
    *   **Note:** The server returns JSON; the frontend is responsible for rendering it using `mind-elixir`.

### 5. FAQ Generation Pipeline (`src/pipelines/generate-faq.ts`)

**Function:** `generateFAQ(llm: Runnable, splitDocs: Document[])`

*   **Description:** Generates a list of Frequently Asked Questions (FAQs) based on the document content.
*   **Input:**
    *   `llm`: The Language Model instance.
    *   `splitDocs`: Array of `Document` objects.
*   **Output:**
    *   `finalFAQ` (string): A list of questions and answers.
*   **Process:**
    *   Uses Map-Reduce to extract potential questions from chunks and then consolidates them.

### 6. Briefing Document Pipeline (`src/pipelines/briefing-doc.ts`)

**Function:** `generateBriefingDoc(llm: Runnable, splitDocs: Document[])`

*   **Description:** Creates a professional briefing document summarizing the key information.
*   **Input:**
    *   `llm`: The Language Model instance.
    *   `splitDocs`: Array of `Document` objects.
*   **Output:**
    *   `finalBriefingDoc` (string): The formatted briefing document.

### 7. QA Over Document Pipeline (`src/pipelines/qa-overdoc.ts`)

**Function:** `qaOverDoc(question: string, chatHistory: string[])` (Conceptual signature)

*   **Description:** Implements a RAG (Retrieval-Augmented Generation) flow to answer user questions.
*   **Process:**
    1.  **Query Transformation:** Rewrites the user query for better retrieval.
    2.  **Retrieval:** Fetches relevant documents from Pinecone.
    3.  **Grading:** Evaluates if retrieved documents are relevant.
    4.  **Generation:** Generates an answer based on relevant context.
    5.  **Hallucination Check:** Verifies if the answer is grounded in the documents.

---

## 📡 API Endpoints & Controllers

The application exposes these pipelines via Express.js controllers in `src/app/http/controllers`. All endpoints are prefixed with `/api/v1`.

### Notes Management

#### 1. Create Note
*   **Endpoint:** `POST /api/v1/notes`
*   **Description:** Uploads a document, processes it (ingestion), and creates a new note.
*   **Content-Type:** `multipart/form-data`
*   **Body:**
    *   `doc`: File (pdf, doc, docx, html, csv, txt) - Max 2MB.
    *   `userId`: string (The ID of the user creating the note).
*   **Response:** JSON object containing the created note details.

#### 2. Get All Notes
*   **Endpoint:** `GET /api/v1/notes`
*   **Description:** Retrieves a paginated list of notes for the user.
*   **Query Parameters:**
    *   `search`: string (Optional search term).
    *   `page`: number (Optional page number, default: 10).
*   **Response:** JSON array of notes.

#### 3. Update Note
*   **Endpoint:** `PUT /api/v1/notes`
*   **Description:** Updates the title of an existing note.
*   **Content-Type:** `application/json`
*   **Body:**
    *   `id`: string (The ID of the note to update).
    *   `title`: string (The new title).
*   **Response:** `{ message: "note updated successfully", updateNote: ... }`

### Feature Generation Endpoints

These endpoints trigger specific AI pipelines to generate content based on an existing note.

#### 4. Generate Summary
*   **Endpoint:** `PUT /api/v1/notes/summary`
*   **Description:** Generates or updates the summary for a note.
*   **Content-Type:** `application/json`
*   **Body:**
    *   `userId`: string
    *   `noteId`: string
*   **Response:** `{ message: "Summary generated successfully", summary: string }`

#### 5. Generate Study Guide
*   **Endpoint:** `PUT /api/v1/notes/StudyGuide`
*   **Description:** Generates or updates the study guide for a note.
*   **Content-Type:** `application/json`
*   **Body:**
    *   `userId`: string
    *   `noteId`: string
*   **Response:** `{ message: "studyGuide generated successfully", studyGuide: string }`

#### 6. Generate Mind Map
*   **Endpoint:** `PUT /api/v1/notes/mindMap`
*   **Description:** Generates or updates the mind map data for a note.
*   **Note:** This endpoint uses **Query Parameters** instead of the request body.
*   **Query Parameters:**
    *   `userId`: string
    *   `noteId`: string
*   **Response:** `{ mindMap: string }` (JSON string in MindElixir format).

#### 7. Generate FAQ
*   **Endpoint:** `PUT /api/v1/notes/faq`
*   **Description:** Generates or updates the FAQ section for a note.
*   **Content-Type:** `application/json`
*   **Body:**
    *   `userId`: string
    *   `noteId`: string
*   **Response:** `{ message: "faq generated successfully", faqDoc: string }`

#### 8. Generate Briefing Document
*   **Endpoint:** `PUT /api/v1/notes/briefing-doc`
*   **Description:** Generates or updates the briefing document for a note.
*   **Content-Type:** `application/json`
*   **Body:**
    *   `userId`: string
    *   `noteId`: string
*   **Response:** `{ message: "briefingDoc generated successfully", briefingDoc: string }`

---

## 🔄 General Workflow

1.  **User Upload:** User uploads a document (PDF, TXT, URL).
2.  **Ingestion:** The system ingests the document, chunks it, and stores embeddings in Pinecone.
3.  **Interaction:** User selects a feature (e.g., "Generate Study Guide").
4.  **Pipeline Execution:** The corresponding LangGraph pipeline is executed.
    *   It retrieves document chunks.
    *   It uses LLMs (OpenAI/Groq) to process the text.
    *   It manages state and reduces results.
5.  **Response:** The final result (text, JSON, etc.) is stored in the database and returned to the user.
