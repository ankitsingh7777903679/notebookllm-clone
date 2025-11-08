import { Annotation, Send, StateGraph } from "@langchain/langgraph";

const ChainState = Annotation.Root({
  generate: Annotation<'jokes' | 'comments'>,
  subjects: Annotation<string[]>,
  comments: Annotation<string[]>({
    reducer: (a, b) => a.concat(b),
  }),
  jokes: Annotation<string[]>({
    reducer: (a, b) => a.concat(b),
  }),
});

const whatToGenerate = async (state: typeof ChainState.State) => {



  return state.subjects.map((subject) => {

    const node = state.generate === 'comments' ? 'generateComment' : 'generate_joke'
    return new Send(node, { subjects: [subject] ,end:".....end text"});


  });

};


const generateComment = async (state: typeof ChainState.State) => {

  console.log('send data :',state.subjects)
  return {
    comments: [`Comment about ${state.subjects} -  ${state.end}`]
  }
};

const generateJoke = async (state: typeof ChainState.State) => {
  return {
    jokes: [`Joke about ${state.subjects}`],
  }
};




const graph = new StateGraph(ChainState)
  .addNode("generate_joke",generateJoke)
  .addNode('generateComment', generateComment)


  .addConditionalEdges("__start__", whatToGenerate, ['generateComment', 'generate_joke'])
  .addEdge("generate_joke", "__end__")
  .addEdge("generateComment", "__end__")

  .compile();

// const res = await graph.invoke({ subjects: ["cats", "dogs"] ,generate: 'comments'});
// console.log(res);


for await (const step of await graph.stream(
  { subjects: ["cats", "dogs", "puma"], generate: 'comments' },
  { recursionLimit: 10 }
)) {
  console.log('s : ', step)
  console.log('step :', Object.keys(step));

}