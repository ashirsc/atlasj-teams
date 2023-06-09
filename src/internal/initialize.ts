import { AskCommandHandler } from "../commandHandlers/ask";
import { BotBuilderCloudAdapter } from "@microsoft/teamsfx";
import { ClearCommandHandler } from "../commandHandlers/clear";
import { LoadCommand } from "../commandHandlers/load";
import config from "./config";
import ConversationBot = BotBuilderCloudAdapter.ConversationBot;

// Create the command bot and register the command handlers for your app.
// You can also use the commandApp.command.registerCommands to register other commands
// if you don't want to register all of them in the constructor
export const commandApp = new ConversationBot({
  // The bot id and password to create CloudAdapter.
  // See https://aka.ms/about-bot-adapter to learn more about adapters.
  adapterConfig: {
    MicrosoftAppId: config.botId,
    MicrosoftAppPassword: config.botPassword,
    MicrosoftAppType: "MultiTenant",
  },
  command: {
    enabled: true,
    commands: [new AskCommandHandler(), new LoadCommand(), new ClearCommandHandler()],
  },
});
