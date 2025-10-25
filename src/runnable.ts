import { RunnableSequence } from "@langchain/core/runnables";
import { RunnableLambda } from "@langchain/core/runnables";
import { RunnableParallel } from "@langchain/core/runnables";

const func1=(x:string) => x.toString()

const runnable1 = RunnableLambda.from(func1); 
const runnable2 = RunnableLambda.from((x: string) => x.toLocaleLowerCase()); 
const runnable3 = RunnableLambda.from((x: string) => x.slice(0, 2)); 

// const chain = new RunnableSequence(
//    { 
//     first:runnable1,
//     last:runnable2,
//     // last:runnable3,
// }

// )

async function main() {
    const chain = runnable1.pipe(runnable2).pipe(runnable3);
    const result = await chain.invoke("HELLO WORLD");

    console.log(`   result: ${result}`);
}

main();


