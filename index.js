import { Client, Events, GatewayIntentBits, REST, Routes } from "discord.js";
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
import memeGIF from "./events/memeGIF.js";
import catPicture from "./events/catPicture.js";
import dogPicture from "./events/dogPicture.js";
import n8nTrigger from "./events/n8nTrigger.js";
// import messageDelete from "./events/messageDelete.js";
// import messageUpdate from "./events/messageUpdate.js";

// 啟用功能
client.on(Events.MessageCreate, issuePRCommit);
client.on(Events.MessageCreate, ping);
client.on(Events.MessageCreate, memeGIF);
client.on(Events.MessageCreate, catPicture);
client.on(Events.MessageCreate, dogPicture);
// client.on(Events.MessageDelete, messageDelete);
// client.on(Events.MessageUpdate, messageUpdate);

// 建立指令集合
const commands = [];

// 添加 N8N 觸發指令
commands.push(n8nTrigger.data.toJSON());

// 設置 Discord REST API
const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

// Bot 啟動時顯示成功訊息並註冊指令
client.once(Events.ClientReady, async (readyClient) => {
  try {
    console.log(`✅ Bot 已啟動，登入為：${readyClient.user.tag}`);

    console.log(`開始註冊 ${commands.length} 個斜線指令...`);

    // 註冊全域指令
    const data = await rest.put(Routes.applicationCommands(client.user.id), {
      body: commands,
    });

    console.log(`成功註冊 ${data.length} 個斜線指令！`);
  } catch (error) {
    console.error(`註冊指令時發生錯誤: ${error}`);
  }
});

// 處理斜線指令的互動事件
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isCommand()) return;

  // 檢查是否為 N8N 觸發指令
  if (interaction.commandName === "trigger") {
    try {
      await n8nTrigger.execute(interaction);
    } catch (error) {
      console.error(`執行指令 ${interaction.commandName} 時發生錯誤:`, error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "```執行此指令時發生錯誤！```",
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: "```執行此指令時發生錯誤！```",
          ephemeral: true,
        });
      }
    }
  }
});

// Log in to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);
