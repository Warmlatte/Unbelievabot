export default function (message) {
  if (message.author.bot) return;

  console.log(`${message.author?.username} 刪除了訊息: ${message.content}`);
  message.channel.send("收回怪抓到(́=◞౪◟◉‵)");
}
