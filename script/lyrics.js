module.exports.config = {
  name: "lyrics",
  role: 0, 
  description: "Search Lyrics",
  usage: "[title of song]",
  credits: "jay lord",
  cooldown: 0,
  hasPrefix: true
}

module.exports.run = async function({ api, event, args }) {
  const fs = require("fs");
  const axios = require("axios");
  const t = args.join(" ");

  if (!t) return api.sendMessage("❌️ | 𝗘𝗥𝗥𝗢𝗥 𝗬𝗢𝗨𝗥 𝗠𝗜𝗦𝗦𝗜𝗡𝗚 𝗔 𝗦𝗢𝗡𝗚 𝗡𝗔𝗠𝗘. 𝗣𝗟𝗘𝗔𝗦𝗘 𝗧𝗥𝗬 𝗔𝗚𝗔𝗜𝗡 𝗟𝗔𝗧𝗘𝗥 𝗪𝗜𝗧𝗛 𝗔 𝗦𝗢𝗡𝗚 𝗡𝗔𝗠𝗘.", event.threadID, event.messageID);

  try {
    const r = await axios.get('https://lyrist.vercel.app/api/' + t);
    const { image, lyrics, artist, title } = r.data;

    let ly = __dirname + "/../public/image/lyrics.png";
    let suc = (await axios.get(image, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(ly, Buffer.from(suc, "utf-8"));
    let img = fs.createReadStream(ly);

    api.setMessageReaction("🤡", event.messageID, (err) => {}, true);

    return api.sendMessage({
      body: `𝗦𝗢𝗡𝗚 𝗧𝗜𝗧𝗟𝗘:${title}𝗦𝗢𝗡𝗚 𝗢𝗪𝗡𝗘𝗥: ${artist}\n━━━━━━━━━━━━━━━━━━━━\n𝗦𝗢𝗡𝗚 𝗟𝗬𝗥𝗜𝗖𝗦:${lyrics}\n━━━━━━━━━━━━━━━━━━━━\n 𝗠𝘆 𝗼𝘄𝗻𝗲𝗿 𝗶𝘀 𝗺𝗮𝗸𝗶𝗻𝗴 𝗻𝗲𝘄 𝗰𝗺𝗱 𝘀𝗼 𝗽𝗹𝗲𝗮𝘀𝗲 𝘄𝗮𝗶𝘁 𝗳𝗼𝗿 𝗮 𝘂𝗽𝗱𝗮𝘁𝗲 𝗳𝗿𝗼𝗺 𝗺𝘆 𝗼𝘄𝗻𝗲𝗿.`,
      attachment: img
    }, event.threadID, () => fs.unlinkSync(ly), event.messageID);
  } catch (a) {
    api.setMessageReaction("🙋", event.messageID, (err) => {}, true);

    return api.sendMessage(a.message, event.threadID, event.messageID);
  }
}
