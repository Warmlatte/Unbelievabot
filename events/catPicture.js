import axios from "axios";

export default async function (message) {
  if (message.content === "!cat") {
    try {
      const response = await axios.get(
        "https://api.thecatapi.com/v1/images/search",
        { headers: { "x-api-key": process.env.CAT_API_KEY } }
      );

      const catImageUrl = response.data[0].url;
      message.reply(catImageUrl);
    } catch (error) {
      console.error("❌ 獲取貓貓圖片失敗：", error);
      message.reply("⚠️ 無法取得貓貓圖片，請稍後再試！(๑•́ ₃ •̀๑)");
    }
  }
}
