import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

export class HNSWSingleton {
    private static instance: HNSWSingleton;
    private vectorStore: HNSWLib; // Define the actual type here

    private constructor() { // Define the actual types here
        this.initialize();
    }

    private initialize(): void {
        this.vectorStore = new HNSWLib(new OpenAIEmbeddings({ openAIApiKey: "" }), { space: "cosine" })
    }

    public static getInstance(): HNSWSingleton { // Define the actual types here
        if (!HNSWSingleton.instance) {
            HNSWSingleton.instance = new HNSWSingleton();
        }
        return HNSWSingleton.instance;
    }

    public getVectorStore(): HNSWLib { // Define the actual type here
        return this.vectorStore;
    }
}