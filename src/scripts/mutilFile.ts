import "dotenv/config"

import {
  BasicTranslator,
  SelfQueryRetriever,
} from "langchain/retrievers/self_query";
import { ConversationalRetrievalQAChain, RetrievalQAChain, loadQARefineChain } from "langchain/chains";
import { OpenAI, OpenAIChat } from "langchain/llms/openai";

import { AttributeInfo } from "langchain/schema/query_constructor";
import { BufferMemory } from "langchain/memory";
import { Chroma } from "langchain/vectorstores/chroma";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { LineReader } from "./LineReader";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { PromptTemplate } from "langchain/prompts";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { createSpinner } from 'nanospinner'
import path from "path"

// if (
//   !process.env.PINECONE_API_KEY ||
//   !process.env.PINECONE_ENVIRONMENT ||
//   !process.env.PINECONE_INDEX
// ) {
//   throw new Error(
//     "PINECONE_ENVIRONMENT and PINECONE_API_KEY and PINECONE_INDEX must be set"
//   );
// }







// const attributeInfo: AttributeInfo[] = [
//   {
//     name: "source",
//     description: "The path of the transcript source file",
//     type: "faile path",
//   },
//   {
//     name: "interviewer",
//     description: "The Franklin Covey representative conducting the interview.",
//     type: "string or array of strings",
//   },
//   {
//     name: "interviewee",
//     description: "The Franklin Covey customer being interviewed.",
//     type: "string",
//   },
//   {
//     name: "outcome",
//     description: "Whether the interviewing company chose to purchase Franklin Covey services.",
//     type: "string",
//   },
// ];

export const run = async () => {
  const model = new OpenAIChat({ temperature: 0.5 })
  const loader = new DirectoryLoader(
    "docs/fc/transcripts",
    {
      ".txt": (path) => new TextLoader(path)
    }
  );
  let docs = await loader.load();

  const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
  docs = await textSplitter.splitDocuments(docs)

  // let missCount = 0
  // docs = docs.map(doc => {
  //   const filename = path.basename(doc.metadata.source);
  //   switch (filename) {
  //     case "aerovironment.txt":
  //       doc.metadata.interviewer = "Curtis S. Clawson"
  //       doc.metadata.interviewee = "Ashley Schaefer"
  //       doc.metadata.outcome = "win"
  //       break;
  //     case "arrowmanufacturing.txt":
  //       doc.metadata.interviewer = "Adam Merrill"
  //       doc.metadata.interviewee = "Pam McArthur"
  //       doc.metadata.outcome = "win"
  //       break;
  //     case "instructure.txt":
  //       doc.metadata.interviewer = "Adam Merrill:"
  //       doc.metadata.interviewee = "Deonne Johnson"
  //       doc.metadata.outcome = "loss"
  //       break;
  //     case "odwlogistics.txt":
  //       doc.metadata.interviewer = "Curtis Clawson"
  //       doc.metadata.interviewee = "Jill Spohn"
  //       doc.metadata.outcome = "win"
  //       break;

  //     default:
  //       missCount++
  //       break;
  //   }
  //   return doc
  // })
  // console.log(`Missed adding metadata to ${missCount} docs`)



  // const client = new PineconeClient();
  // await client.init({
  //   apiKey: process.env.PINECONE_API_KEY,
  //   environment: process.env.PINECONE_ENVIRONMENT,
  // });
  // const pineconeIndex = client.Index(process.env.PINECONE_INDEX);
  // const documentContents = "Transcipts of calls between a Franklin Covey rep and a rep of a Franklin Covey customer.";
  // // const vectorStore = await PineconeStore.fromDocuments(docs, new OpenAIEmbeddings(), {
  // //   pineconeIndex
  // // });
  // const vectorStore = await new PineconeStore(new OpenAIEmbeddings(), {pineconeIndex})
  // //this adds the docs every time.
  // // .fromDocuments(docs, new OpenAIEmbeddings(), {
  // //   pineconeIndex
  // // });
  // const selfQueryRetriever = await SelfQueryRetriever.fromLLM({
  //   llm: model,
  //   vectorStore,
  //   documentContents,
  //   attributeInfo,
  //   structuredQueryTranslator: new BasicTranslator(),
  // });

  const vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings());


  const reader = new LineReader();

  const chain = ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorStore.asRetriever(),
    // selfQueryRetriever,
    {
      memory: new BufferMemory({
        memoryKey: "chat_history", // Must be set to "chat_history"
      }),
      verbose:false
    }
  );



  while (true) {

    const question = await reader.getLine();


    const spinner = createSpinner('getting response').start()
    // const res = await selfQueryRetriever.getRelevantDocuments(question );
    // spinner.success()
    // console.log(res)
    const res = await chain.call({ question });
    spinner.success({ text: res.text })
  }

};

run()