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
        temperature: 0.9,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // ✅ 確保只提取 JSON 內容
    const openAIResponse = response.data.choices[0].message.content.trim();

    // 🛡️ 使用正則表達式提取 JSON 區塊
    const jsonRegex = /{[\s\S]*}/;
    const jsonMatch = openAIResponse.match(jsonRegex);

    if (!jsonMatch) {
      throw new Error("❌ OpenAI 回傳的內容不包含有效的 JSON 物件");
    }

    const jsonString = jsonMatch[0];

    // ✅ 解析 JSON
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("❌ OpenAI API 錯誤:", error.response?.data || error.message);
    return null;
  }
}

export async function generateIssue(description) {
  return await callOpenAI(`請根據以下描述生成 Issue，回傳純 JSON 格式：
  
  **範例輸出格式：**
  \`\`\`json
  {
    "title": "Issue 標題",
    "body": "### 功能描述\\n${description}\\n\\n### 需求細節\\n1. 請詳細說明需求\\n2. 需要哪些功能\\n3. 任何其他細節\\n\\n### 預期交付時間\\n希望在下個版本完成此功能。"
  }
  \`\`\`
  
  請直接回傳 JSON，避免多餘的文字。`);
}

export async function generatePR(description) {
  return await callOpenAI(`請根據以下描述生成 PR，回傳純 JSON 格式：
  
  **範例輸出格式：**
  \`\`\`json
  {
    "title": "PR 標題",
    "body": "### 變更內容\\n${description}\\n\\n### 關聯 Issue\\n- #12"
  }
  \`\`\`
  
  請直接回傳 JSON，避免多餘的文字。`);
}

export async function generateCommit(description) {
  return await callOpenAI(
    `你是一個 GitHub Commit 翻譯助手，請將以下 Commit 訊息 **翻譯成英文** 並轉換為 **Conventional Commit** 格式，回傳純 JSON 格式：

  **範例輸出格式：**
  \`\`\`json
  {
    "commit": "feat(scope): add new search feature"
  }
  \`\`\`

  **可用的 commit 類型：**
  - feat: 新功能
  - fix: 修復問題
  - docs: 文件變更
  - style: 格式調整（不影響程式邏輯）
  - refactor: 重構程式碼
  - test: 新增或修改測試
  - chore: 其他雜項

  **輸入的 Commit 訊息：**
  "${description}"

  **請直接回傳 JSON 格式，避免多餘的文字。**`
  );
}
