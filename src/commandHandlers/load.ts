import { Activity, CardFactory, MessageFactory, TurnContext } from "botbuilder";
import { AnalyzeDocumentChain, loadSummarizationChain } from "langchain/chains";
import {
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    MessagesPlaceholder,
    SystemMessagePromptTemplate,
} from "langchain/prompts";
import { CommandMessage, TeamsFxBotCommandHandler, TriggerPatterns } from "@microsoft/teamsfx";
import { loadQAMapReduceChain, loadQAStuffChain } from "langchain/chains";

import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { HNSWSingleton } from "../VectorStore";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { TextLoader } from "langchain/document_loaders/fs/text";

/**
 * The `HelloWorldCommandHandler` registers a pattern with the `TeamsFxBotCommandHandler` and responds
 * with an Adaptive Card if the user types the `triggerPatterns`.
 */
export class LoadCommand implements TeamsFxBotCommandHandler {
    triggerPatterns: TriggerPatterns = "/load";

   

    async handleCommandReceived(
        context: TurnContext,
        message: CommandMessage
    ): Promise<string | Partial<Activity> | void> {
        console.log(`App received /load command message: ${message.text}`);

        const loader = new DirectoryLoader(
            "docs/fc/transcripts",
            {
                ".txt": (path) => new TextLoader(path)
            }
        );
        let docs = await loader.load();

        const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
        docs = await textSplitter.splitDocuments(docs)


    //   TODO put this into a singleton
        // const vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings());
        // vectorStore.addDocuments()
        const hnsw = await HNSWSingleton.getInstance();
        const vectorStore = hnsw.getVectorStore()
        await vectorStore.addDocuments(docs)
        




        return MessageFactory.text(`Loaded ${docs.length} docs`);
    }
}
