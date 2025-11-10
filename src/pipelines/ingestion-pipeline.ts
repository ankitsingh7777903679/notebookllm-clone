import {Document} from "@langchain/core/documents"
import {RecursiveCharacterTextSplitter} from "@langchain/textsplitters"
import {CohereEmbeddings} from "@langchain/cohere"
import {PineconeStore} from "@langchain/pinecone"
import {Pinecone as PineconeClientf} from "@pinecone-database/pinecone"
import {CheerioWebBaseLoader} from "@langchain/community/document_loaders/web/cheerio"
import "dotenv/config"

export async function webFileEmbedding(url: string){
    // loading
    const loader = new CheerioWebBaseLoader(url);
    const docs = await loader.load() 

    // chunk Overlapping
    const textsplitters = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 100,
    })
    const allSplits = await textsplitters.splitDocuments(docs)

    // embedding
    const embeddings = new CohereEmbeddings({
        apiKey: process.env.COHERE_API_KEY,
        model: 'embed-english-v3.0',
    })

    const pinecone = new PineconeClientf({
        apiKey: process.env.PINECONE_API_KEY as string,
    });

    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX as string);

    const vectorStore = new PineconeStore(embeddings, {
        pineconeIndex: pineconeIndex,
        maxConcurrency: 5,
    })

    await vectorStore.addDocuments(allSplits);
    console.log('Finished indexing...')

    
}

await webFileEmbedding('https://lilianweng.github.io/posts/2023-03-15-prompt-engineering/');

