const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports.config = {
  name: "4k",
  version: "1.0.0",
  hasPermission: 0,
  aliases:["enhace"],
  credits: "𝙹𝙰𝚈𝙳𝙴𝙽 𝚂𝙼𝙸𝚃𝙷",
  description: "Enhance image using 4𝚔 API",
  commandCategory: "tools",
  usages: "[ reply a photo ]",
  cooldowns: 0,
};

module.exports.run = async function ({ api, event, args }) {
  const messageReply = event.messageReply;

  if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0 || messageReply.attachments[0].type !== "photo") {
    return api.sendMessage("❌ | Reply must be an image.", event.threadID, event.messageID);
  }

  const photoUrl = messageReply.attachments[0].url;

  try {
    const response = await axios.get(`https://eurix-api.replit.app/remini?input=${encodeURIComponent(photoUrl)}`, { responseType: "arraybuffer"});
    const img = response.data;


    const photoPath = path.join(__dirname, 'cache', 'enhanced.jpg');

    fs.writeFileSync(photoPath, Buffer.from(img), 'binary');

    api.sendMessage({ body: "✅ | 𝗬𝗼𝘂𝗿 𝗶𝗺𝗮𝗴𝗲 𝗵𝗮𝘀 𝗯𝗲𝗲𝗻 𝗘𝗻𝗵𝗮𝗻𝗰𝗲𝗱. 𝗵𝗮𝘃𝗲 𝗮 𝗴𝗿𝗲𝗮𝘁 𝘁𝗶𝗺𝗲 𝘂𝘀𝗶𝗻𝗴 𝗺𝘆 𝗮𝘂𝘁𝗼𝗯𝗼𝘁", attachment: fs.createReadStream(photoPath) }, event.threadID, event.messageID);
  } catch (error) {
    console.error("Error calling 4𝗸 API:", error);
    api.sendMessage(`An error occurred while processing the image. Please try again later. 𝗙𝗼𝗿 𝗻𝗼𝘄 𝘆𝗼𝘂 𝗰𝗮𝗻 𝘂𝘀𝗲 𝗺𝘆 𝗼𝘁𝗵𝗲𝗿 𝗰𝗼𝗺𝗺𝗮𝗻𝗱𝘀 𝗼𝗿 𝗰𝗿𝗲𝗮𝘁𝗲 𝘆𝗼𝘂 𝗼𝘄𝗻 𝗮𝘂𝘁𝗼𝗯𝗼𝘁 𝘂𝘀𝗶𝗻𝗴 𝗺𝘆 𝗰𝗼𝗺𝗺𝗮𝗻𝗱 𝗻𝗮𝗺𝗲𝗱 𝘄𝗲𝗯𝘀𝗶𝘁𝗲. 𝗰𝗵𝗲𝗰𝗸 𝗶𝘁 𝗮𝗻𝗱 𝘂𝘀𝗲 𝗶𝘁.\n${error}`, event.threadID, event.messageID);
  }
};
