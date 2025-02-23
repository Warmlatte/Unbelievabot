import axios from "axios";

export default async function (message) {
  if (message.content === "!dog") {
    try {
      const response = await axios.get(
        "https://api.thedogapi.com/v1/images/search",
        { headers: { "x-api-key": process.env.DOG_API_KEY } }
      );

      const dogImageUrl = response.data[0].url;
      message.reply(dogImageUrl);
    } catch (error) {
      console.error("❌ 獲取狗狗圖片失敗：", error);
      message.reply("⚠️ 無法取得狗狗圖片，請稍後再試！(๑•́ ₃ •̀๑)");
    }
  }
}
