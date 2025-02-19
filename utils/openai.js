import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

async function callOpenAI(prompt) {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o",
        messages: [
          { role: "system", content: "你是一個 GitHub 助手。" },
          { role: "user", content: prompt },
        ],
        temperature: 0.5,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    let content = response.data.choices[0].message.content;
    content = content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(content);
  } catch (error) {
    console.error("❌ OpenAI API 錯誤:", error);
    return null;
  }
}

export async function generateIssue(description) {
  return await callOpenAI(`請根據以下描述生成 Issue：\n\n${description}`);
}

export async function generatePR(description) {
  return await callOpenAI(`請根據以下描述生成 PR：\n\n${description}`);
}

export async function generateCommit(description) {
  return await callOpenAI(`請將以下 Commit 翻譯並轉換格式：\n\n${description}`);
}
