import "dotenv/config"

import { OpenAI, OpenAIChat } from "langchain/llms/openai";

import { BufferMemory } from "langchain/memory";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { HNSWSingleton } from "./VectorStore";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

export class ConvoRetieveChainFactory {
    private static instance: ConvoRetieveChainFactory;
    private chain: ConversationalRetrievalQAChain; 

    private constructor() { 
        this.initialize();
    }

    private async initialize(): Promise<void> {
        const hnsw =  HNSWSingleton.getInstance();
        const vectorStore = hnsw.getVectorStore()

        this.chain = ConversationalRetrievalQAChain.fromLLM(
            new OpenAIChat({temperature: 0.5,openAIApiKey: "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"}),
            vectorStore.asRetriever(),
            {
                memory: new BufferMemory({
                    memoryKey: "chat_history", // Must be set to "chat_history"
                }),
                verbose: false
            }
        );
    }

    public static getInstance(): ConvoRetieveChainFactory { 
        if (!ConvoRetieveChainFactory.instance) {
            ConvoRetieveChainFactory.instance = new ConvoRetieveChainFactory();
        }
        return ConvoRetieveChainFactory.instance;
    }

    public getChain(): ConversationalRetrievalQAChain {
        return this.chain;
    }

    public resetChain(): void {
        this.initialize()
    }
}