import "dotenv/config"

import * as fs from "fs";

import { ConversationalRetrievalQAChain, RetrievalQAChain, loadQARefineChain } from "langchain/chains";
import { OpenAI, OpenAIChat } from "langchain/llms/openai";

import { BufferMemory } from "langchain/memory";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PromptTemplate } from "langchain/prompts";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { TextLoader } from "langchain/document_loaders/fs/text";

export const run = async () => {
  // Initialize the LLM to use to answer the question.
  // const model = new OpenAI({});
  const model = new OpenAIChat({ temperature: 0.5 });
  // const loader = new DirectoryLoader(
  //     "docs/fc/transcripts",
  //     {
  //       ".txt": (path) => new TextLoader(path)
  //     }
  //     );
  const loader = new TextLoader("docs/fc/transcripts/odwlogistics.txt")
  let docs = await loader.load();

  const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 500 });
  docs = await textSplitter.splitDocuments(docs)


  // Create a vector store from the documents.
  const vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings());

  // const prompt = new PromptTemplate({
  //   template: "Act like an analytics intern\n{question}",
  //   inputVariables: ["question"],
  // });

  // Create a chain that uses the OpenAI LLM and HNSWLib vector store.

  const question = "What was the client most excited about? "


  const chain = ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorStore.asRetriever(7),
    {
      returnSourceDocuments: true,
      memory: new BufferMemory({
        memoryKey: "chat_history", // Must be set to "chat_history"
      }),
    }
  );



  const res = await chain.call({question});

  

  // console.log(first)
  console.log("### ChatGPT res\n", res.text);
  // console.log(`found ${res.sourceDocuments.length} source docs`)
  // console.log("#### doc 1\n", res.sourceDocuments[0].pageContent)
  // console.log("#### doc 2\n", res.sourceDocuments[1].pageContent)
  // console.log("#### doc 3\n", res.sourceDocuments[2].pageContent)
  // console.log("#### doc 4\n", res.sourceDocuments[3].pageContent)

  const followUpRes = await chain.call({
    question: "what were the quotes that led you to that answer?",
  });
  console.log(followUpRes);

};

run()