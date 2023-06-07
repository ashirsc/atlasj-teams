import { Activity, CardFactory, MessageFactory, TurnContext } from "botbuilder";
import { CommandMessage, TeamsFxBotCommandHandler, TriggerPatterns } from "@microsoft/teamsfx";
import { OpenAI, OpenAIChat } from "langchain/llms/openai";

import { AdaptiveCards } from "@microsoft/adaptivecards-tools";
import { BasePromptTemplate } from "langchain/prompts";
import { CardData } from "../cardModels";
import { HNSWSingleton } from "../VectorStore";
import { RetrievalQAChain } from "langchain/chains";
import helloWorldCard from "../adaptiveCards/helloworldCommand.json";
import path from "path"

/**
 * The `HelloWorldCommandHandler` registers a pattern with the `TeamsFxBotCommandHandler` and responds
 * with an Adaptive Card if the user types the `triggerPatterns`.
 */
export class AskCommandHandler implements TeamsFxBotCommandHandler {
  triggerPatterns: string = "/ask";

  // llm = new OpenAIChat({ maxConcurrency: 10, openAIApiKey: "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" });
  model = new OpenAI({openAIApiKey: ""});

  async handleCommandReceived(
    context: TurnContext,
    message: CommandMessage
  ): Promise<string | Partial<Activity> | void> {
    console.log(`Ask command received message: ${message.text}`);

    

    const hnsw = await HNSWSingleton.getInstance();
    const vectorStore = hnsw.getVectorStore()

    // const p:BasePromptTemplate = {
      
    // }
    
    // const chain = RetrievalQAChain.fromLLM(this.model, vectorStore.asRetriever(), { returnSourceDocuments: true, prompt: });
    const chain = RetrievalQAChain.fromLLM(this.model, vectorStore.asRetriever(), { returnSourceDocuments: true});
    const res = await chain.call({
      // query: "What did customers say about LMS integration and onboarding?",
      query: message.text.replace(this.triggerPatterns, ""),

    });
    console.log({ res, docs: res.sourceDocuments });


    return MessageFactory.text(`${res.text}

    ${res.sourceDocuments.map(sd =>  `${path.basename(sd.metadata.source)}${sd.metadata.loc.lines.from}:${sd.metadata.loc.lines.to}`).join(",")}
    `);

  }
}
