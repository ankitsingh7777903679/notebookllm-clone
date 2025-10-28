import {Document} from "@langchain/core/documents"
import {RecursiveCharacterTextSplitter} from "@langchain/textsplitters"
import {CohereEmbeddings} from "@langchain/cohere"
import {PineconeStore} from "@langchain/pinecone"
import {Pinecone as PineconeClientf} from "@pinecone-database/pinecone"
import {CheerioWebBaseLoader} from "@langchain/community/document_loaders/web/cheerio"
import { CohereRerank } from "@langchain/cohere"
import "dotenv/config"

export async function queryVectorDB(query: string){
    const embeddings = new CohereEmbeddings({
        apiKey: process.env.COHERE_API_KEY,
        model: 'embed-english-v3.0',
    })

    const pinecone = new PineconeClientf({
        apiKey: process.env.PINECONE_API_KEY as string,
    });

    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX as string);

    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
        pineconeIndex: pineconeIndex,
        maxConcurrency: 5,
    })

    const result = await vectorStore.similaritySearch(query, 10);

    return result;


}

const result = await queryVectorDB("What is few-shot?");
console.log(result);













