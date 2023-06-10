import { CardFactory, MessageFactory, TeamsActivityHandler, TurnContext } from "botbuilder";

import { AdaptiveCards } from "@microsoft/adaptivecards-tools";
import { ConvoRetieveChainFactory } from "./ConvoRetreiveChain";

// An empty teams activity handler.
// You can add your customization code here to extend your bot logic if needed.
export class TeamsBot extends TeamsActivityHandler {
  constructor() {
    super();

    this.onMessage(async (context, next) => {

      if (!context.responded){

        const inst =  ConvoRetieveChainFactory.getInstance()
        const chain = inst.getChain()
    
    
        const res = await chain.call({
          question: context.activity.text,
        });
        console.log({ res, docs: res.sourceDocuments });
        
        await context.sendActivity(res.text)
        
      }


      await next();
    });
  }
}
