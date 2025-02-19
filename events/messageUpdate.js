export default function (oldMessage, newMessage) {
  if (oldMessage.author.bot) return;

  console.log(
    `${oldMessage.author?.username} 更新訊息: ${oldMessage.content} → ${newMessage.content}`
  );
  newMessage.channel.send("還想偷改啊(́◉◞౪◟◉‵)");
}
