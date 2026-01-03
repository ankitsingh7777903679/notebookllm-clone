import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { Document } from "@langchain/core/documents";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import path from "node:path";


export async function splitDocToChunks(docs: Document<Record<string, any>>[], props: { chunkSize: number, chunkOverlap: number }) {
    const splitter = new RecursiveCharacterTextSplitter({ ...props });
    const splitDocs = await splitter.splitDocuments(docs);
    return splitDocs

}

export async function loadWeb(url: string) {
    const loader = new CheerioWebBaseLoader(url);
    const docs = await loader.load();

    return docs
}

export async function loadPDF(filePath: string) {
    const loader = new PDFLoader(filePath);
    const docs = await loader.load();

    return docs
}

export async function loadText(filePath: string) {
    const loader = new TextLoader(filePath);
    const docs = await loader.load();
    return docs
}

export async function loadDocument(
    filePath: string,
    doctype: "pdf" | "html" | "txt" | "md",
    chunkSize = 800,
    chunkOverlap = 200,
) {
    const extentionWithoutDot=path.extname(filePath).replace('.','') 
    let docs = null;
    switch (extentionWithoutDot.trim().toLowerCase()) {
        case 'pdf':
            docs = await loadPDF(filePath);
            break;
        case 'html':
            docs = await loadWeb(filePath);
            break;
        case 'txt':
            docs = await loadText(filePath);
            break;
        case 'md':
            docs = await loadText(filePath);
            break;    
        default: throw new Error(`Unsupported file type: .${extentionWithoutDot}. Supported formats: pdf, html, txt`);
    }
    return splitDocToChunks(docs, { chunkSize, chunkOverlap });
}


// export function getDocChunk (docSplit : any[]){ 
//     const docChunk = [] as any 
//     if (docSplit.length > 0) { 
//         docChunk.push(docSplit[0]) 
//     } else { 
//         throw new Error('The provide Document is empty')  
//     }
//     return docChunk
// } 
