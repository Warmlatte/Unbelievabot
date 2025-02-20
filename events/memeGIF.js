import axios from "axios";

export default async function (message) {
  if (message.author.bot) return;

  if (message.content.startsWith("!gif")) {
    const searchQuery = message.content.replace("!gif", "").trim();

    try {
      let response;
      let gifUrl;

      if (searchQuery) {
        response = await axios.get("https://api.giphy.com/v1/gifs/search", {
          params: {
            api_key: process.env.GIPHY_API_KEY,
            q: searchQuery,
            rating: "pg",
          },
        });

        const GIFs = response.data.data;
        if (GIFs.length > 0) {
          const randomGIF = GIFs[Math.floor(Math.random() * GIFs.length)];
          gifUrl = randomGIF.images.original.url;
        } else {
          return message.reply("⚠️ 找不到相關 GIF，換個關鍵字試試！(ㆀ˘･з･˘)");
        }
      } else {
        response = await axios.get("https://api.giphy.com/v1/gifs/random", {
          params: {
            api_key: process.env.GIPHY_API_KEY,
            tag: "meme",
            rating: "pg",
          },
        });

        gifUrl = response.data.data.images.original.url;
      }

      if (gifUrl) {
        message.reply(gifUrl);
      } else {
        message.reply("⚠️ 無法取得 GIF，請稍後再試！(๑•́ ₃ •̀๑)");
      }
    } catch (error) {
      console.error("❌ 取得 GIF 失敗：", error);
      message.reply("⚠️ 無法獲取 GIF，請稍後再試！(๑•́ ₃ •̀๑)");
    }
  }
}
