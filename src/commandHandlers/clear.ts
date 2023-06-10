import { Activity, CardFactory, MessageFactory, TurnContext } from "botbuilder";
import { CommandMessage, TeamsFxBotCommandHandler, TriggerPatterns } from "@microsoft/teamsfx";

import { ConvoRetieveChainFactory } from "../ConvoRetreiveChain";

export class ClearCommandHandler implements TeamsFxBotCommandHandler {
    triggerPatterns: string = "/clear";



    async handleCommandReceived(
        context: TurnContext,
        message: CommandMessage
    ): Promise<string | Partial<Activity> | void> {
        console.log(`Clear command received.`);

        const inst = ConvoRetieveChainFactory.getInstance()
        inst.resetChain()

        return MessageFactory.text(`Cleared memory`);

    }
}
