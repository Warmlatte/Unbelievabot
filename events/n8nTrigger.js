import { SlashCommandBuilder } from "@discordjs/builders";
import axios from "axios";

const n8nTriggerCommand = {
  data: new SlashCommandBuilder()
    .setName("trigger")
    .setDescription("發送訊息到 N8N 觸發頻道")
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("要觸發的訊息內容")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("workflow")
        .setDescription("工作流程名稱（可選）")
        .setRequired(false)
    ),

  async execute(interaction) {
    try {
      const triggerMessage = interaction.options.getString("message");
      const workflowName =
        interaction.options.getString("workflow") || "預設工作流程";

      const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
      const targetChannelId = process.env.N8N_TRIGGER_CHANNEL_ID;

      if (!n8nWebhookUrl && !targetChannelId) {
        await interaction.reply({
          content:
            "⚠️ 未設定 N8N 觸發器！請聯繫管理員設定 `N8N_WEBHOOK_URL` 或 `N8N_TRIGGER_CHANNEL_ID` 環境變數。",
          flags: 64, // ephemeral flag
        });
        return;
      }

      // 解析桌遊格式：桌遊名稱 BGG_URL
      const parseBoardGameFormat = (message) => {
        // 尋找最後一個以 http 開頭的 URL
        const urlMatch = message.match(/(https?:\/\/[^\s]+)(?:\s|$)/);

        if (urlMatch) {
          const url = urlMatch[1];
          const urlIndex = message.indexOf(url);
          const gameName = message.substring(0, urlIndex).trim();

          // 從 BGG URL 中提取遊戲 ID
          const extractBggId = (url) => {
            // 匹配 BGG URL 格式：https://boardgamegeek.com/boardgame/[ID]/[name]
            const bggIdMatch = url.match(
              /boardgamegeek\.com\/boardgame\/(\d+)/i
            );
            if (bggIdMatch) {
              return bggIdMatch[1];
            }

            // 匹配其他可能的 BGG URL 格式
            const altBggMatch = url.match(/bgg\.cc\/(\d+)/i);
            if (altBggMatch) {
              return altBggMatch[1];
            }

            return null;
          };

          const gameId = extractBggId(url);

          return {
            gameName: gameName || "未知桌遊",
            bggUrl: url,
            bggId: gameId,
            isParsed: true,
          };
        }

        // 如果沒有找到 URL，將整個訊息當作桌遊名稱
        return {
          gameName: message,
          bggUrl: "",
          bggId: null,
          isParsed: false,
        };
      };

      const parsedGame = parseBoardGameFormat(triggerMessage);

      const triggerData = {
        // 原始資料
        message: triggerMessage,
        workflow: workflowName,
        triggeredBy: interaction.user.username,
        triggeredAt: new Date().toISOString(),
        channelName: interaction.channel?.name || "私訊",
        timestamp: new Date().toLocaleString("zh-TW", {
          timeZone: "Asia/Taipei",
        }),

        // 解析後的桌遊資料
        gameName: parsedGame.gameName,
        bggUrl: parsedGame.bggUrl,
        bggId: parsedGame.bggId,
        isParsedFormat: parsedGame.isParsed,
      };

      let success = false;
      let successMessage = "";

      // 嘗試發送到 n8n webhook
      if (n8nWebhookUrl) {
        try {
          await axios.post(n8nWebhookUrl, triggerData, {
            headers: {
              "Content-Type": "application/json",
            },
            timeout: 10000, // 10秒超時
          });
          success = true;
          successMessage += `✅ 觸發訊息已發送到 N8N webhook！\n`;
        } catch (webhookError) {
          console.error("❌ Webhook 發送失敗：", webhookError.message);
          successMessage += `⚠️ Webhook 發送失敗：${webhookError.message}\n`;
        }
      }

      // 嘗試發送到 Discord 頻道（如果有設定且為有效的頻道 ID）
      if (
        targetChannelId &&
        targetChannelId !== "YOUR_CHANNEL_ID_HERE" &&
        !targetChannelId.startsWith("http")
      ) {
        try {
          const targetChannel = await interaction.client.channels.fetch(
            targetChannelId
          );

          if (targetChannel) {
            const triggerPayload = {
              content: `🤖 **N8N 觸發器**\n📝 **訊息**: ${triggerMessage}\n👤 **觸發者**: ${interaction.user.username}\n🔄 **工作流程**: ${workflowName}\n🕐 **時間**: ${triggerData.timestamp}`,
              embeds: [
                {
                  title: "N8N Workflow Trigger",
                  description: triggerMessage,
                  color: 0x00ff00,
                  fields: [
                    {
                      name: "觸發者",
                      value: interaction.user.username,
                      inline: true,
                    },
                    {
                      name: "來源頻道",
                      value: interaction.channel?.name || "私訊",
                      inline: true,
                    },
                    {
                      name: "工作流程",
                      value: workflowName,
                      inline: true,
                    },
                    {
                      name: "觸發時間",
                      value: triggerData.timestamp,
                      inline: false,
                    },
                  ],
                  timestamp: new Date().toISOString(),
                },
              ],
            };

            await targetChannel.send(triggerPayload);
            success = true;
            successMessage += `✅ 觸發訊息已發送到 <#${targetChannelId}>！\n`;
          }
        } catch (channelError) {
          console.error("❌ 頻道發送失敗：", channelError.message);
          successMessage += `⚠️ Discord 頻道發送失敗：${channelError.message}\n`;
        }
      }

      if (!success && !successMessage.includes("✅")) {
        await interaction.reply({
          content: "⚠️ 所有觸發方式都失敗了！請檢查設定或聯繫管理員。",
          flags: 64, // ephemeral flag
        });
        return;
      }

      // 回覆確認訊息，包含解析結果
      let confirmationMessage = successMessage;
      confirmationMessage += `🔄 工作流程：${workflowName}\n`;

      if (parsedGame.isParsed) {
        confirmationMessage += `🎲 桌遊名稱：${parsedGame.gameName}\n🔗 BGG 網址：${parsedGame.bggUrl}`;
        if (parsedGame.bggId) {
          confirmationMessage += `\n🆔 遊戲 ID：${parsedGame.bggId}`;
        }
      } else {
        confirmationMessage += `📝 內容：${triggerMessage}`;
      }

      await interaction.reply({
        content: confirmationMessage,
        flags: 64, // ephemeral flag
      });
    } catch (error) {
      console.error("❌ N8N 觸發器執行錯誤：", error);

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "⚠️ 觸發器執行失敗！請稍後再試或聯繫管理員。",
          flags: 64, // ephemeral flag
        });
      } else {
        await interaction.reply({
          content: "⚠️ 觸發器執行失敗！請稍後再試或聯繫管理員。",
          flags: 64, // ephemeral flag
        });
      }
    }
  },
};

export default n8nTriggerCommand;
