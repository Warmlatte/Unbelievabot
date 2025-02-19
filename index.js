import { Client, Events, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";

dotenv.config();

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

// 載入事件
import issuePRCommit from "./events/issuePRCommit.js";
import ping from "./events/ping.js";
import messageDelete from "./events/messageDelete.js";
import messageUpdate from "./events/messageUpdate.js";
import memeGIF from "./events/memeGIF.js";

// 啟用功能
client.on(Events.MessageCreate, issuePRCommit);
client.on(Events.MessageCreate, ping);
client.on(Events.MessageDelete, messageDelete);
client.on(Events.MessageUpdate, messageUpdate);
client.on(Events.MessageCreate, memeGIF);

// Bot 啟動時顯示成功訊息
client.once(Events.ClientReady, (readyClient) => {
  console.log(`✅ Bot 已啟動，登入為：${readyClient.user.tag}`);
});

// Log in to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);
