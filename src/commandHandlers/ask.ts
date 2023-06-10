import { Activity, CardFactory, MessageFactory, TurnContext } from "botbuilder";
import { CommandMessage, TeamsFxBotCommandHandler, TriggerPatterns } from "@microsoft/teamsfx";
import { ConversationalRetrievalQAChain, RetrievalQAChain } from "langchain/chains";
import { OpenAI, OpenAIChat } from "langchain/llms/openai";

import { AdaptiveCards } from "@microsoft/adaptivecards-tools";
import { BasePromptTemplate } from "langchain/prompts";
import { BufferMemory } from "langchain/memory";
import { CardData } from "../cardModels";
import { ConvoRetieveChainFactory } from "../ConvoRetreiveChain";
import { HNSWSingleton } from "../VectorStore";
import helloWorldCard from "../adaptiveCards/helloworldCommand.json";
import path from "path"

/**
 * The `HelloWorldCommandHandler` registers a pattern with the `TeamsFxBotCommandHandler` and responds
 * with an Adaptive Card if the user types the `triggerPatterns`.
 */
export class AskCommandHandler implements TeamsFxBotCommandHandler {
  triggerPatterns: string = "/ask";

  // llm = new OpenAIChat({ maxConcurrency: 10, openAIApiKey: "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" });
  // model = new OpenAI({ openAIApiKey: "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" });

  async handleCommandReceived(
    context: TurnContext,
    message: CommandMessage
  ): Promise<string | Partial<Activity> | void> {
    console.log(`Ask command received message: ${message.text}`);



    

   

    const inst =  ConvoRetieveChainFactory.getInstance()
    const chain = inst.getChain()


    const res = await chain.call({
      question: message.text.replace(this.triggerPatterns, ""),
    });
    console.log({ res, docs: res.sourceDocuments });


    return MessageFactory.text(`${res.text}`);

  }
}
