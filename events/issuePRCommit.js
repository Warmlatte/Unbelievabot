import { generateIssue, generatePR, generateCommit } from "../utils/openai.js";

export default async function (message) {
  if (message.author.bot) return;

  const userMessage = message.content.trim();
  let actionType, generatedData;

  if (userMessage.startsWith("#issue")) {
    actionType = "issue";
    generatedData = await generateIssue(
      userMessage.replace("#issue", "").trim()
    );
  } else if (userMessage.startsWith("#pr")) {
    actionType = "pr";
    generatedData = await generatePR(userMessage.replace("#pr", "").trim());
  } else if (userMessage.startsWith("#commit")) {
    actionType = "commit";
    generatedData = await generateCommit(
      userMessage.replace("#commit", "").trim()
    );
  }

  if (!generatedData) return;

  // 格式化回應
  let formattedMessage = "";
  if (actionType === "issue") {
    formattedMessage = `🔹 **GitHub Issue 建議內容** 🔹\n\n**標題：** ${generatedData.title}\n\n**描述：**\n${generatedData.body}`;
  } else if (actionType === "pr") {
    formattedMessage = `🔹 **GitHub PR 建議內容** 🔹\n\n**標題：** ${generatedData.title}\n\n**描述：**\n${generatedData.body}`;
  } else if (actionType === "commit") {
    formattedMessage = `🔹 **翻譯後的 Commit 訊息** 🔹\n\`${generatedData.commit}\``;
  }

  if (formattedMessage.trim() !== "") {
    message.reply(formattedMessage);
  } else {
    message.reply("⚠️ 無法產生內容，請稍後再試！(๑•́ ₃ •̀๑)");
  }
}
