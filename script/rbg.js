const axios = require('axios');
const fs = require('fs-extra');

module.exports.config = {
  name: "removebg",
  version: "1.0",
  role: 0,
  hasPermision: 0,
  aliases:["rbg"], 
  commandCategory: "Utility",
  credits: "lord king",//api by hazey 
  description: "Enhance your photo by removing the background.",
  hasPrefix: true,
  cooldowns: 2,
  usePrefix: false,
  cooldown: 2,
  usage: "replying photo",
  usages: "replying photo"
};

module.exports.run = async ({ api, event, args }) => {
  let pathie = __dirname + `/../cache/remove_bg.jpg`;
  const { threadID, messageID } = event;

  let photoUrl = event.messageReply ? event.messageReply.attachments[0].url : args.join(" ");

  if (!photoUrl) {
    api.sendMessage("⛔|𝗥𝗘𝗣𝗟𝗬 𝗬𝗢𝗨𝗥 𝗣𝗛𝗢𝗧𝗢 𝗢𝗥 𝗜𝗠𝗔𝗚𝗘 🙋.", threadID, messageID);
    return;
  }

  try {
    api.sendMessage("🕟 | 𝗪𝗔𝗜𝗧...🧃", threadID, messageID);
    const response = await axios.get(`https://haze-code-merge-0f8f4bbdea12.herokuapp.com/api/try/removebg?url=${encodeURIComponent(photoUrl)}`);
    const processedImageURL = response.data.image_data;

    const img = (await axios.get(processedImageURL, { responseType: "arraybuffer" })).data;

    fs.writeFileSync(pathie, Buffer.from(img, 'binary'));

    api.sendMessage({
      body: "🔮 |𝗙𝗜𝗡𝗦𝗛 𝗡𝗢𝗪 ",
      attachment: fs.createReadStream(pathie)
    }, threadID, () => fs.unlinkSync(pathie), messageID);
  } catch (error) {
    api.sendMessage(`Error processing image: ${error}`, threadID, messageID);
  };
};
