const axios = require('axios');
const path = require('path');

module.exports.config = {
	name: "imgbb",
	version: "1.0.0",
	role: 0,
  hasPermission: 0,
  commandCategory: "image",
	credits: "𝗹𝗼𝗿𝗱 𝗸𝗶𝗻𝗴",
	hasPrefix: true,
  usePrefix: false,
	description: "Upload an image to imgbb",
	usage: "{pn} <attached image>",
	cooldowns: 5,
  usages: "{pn} <attached image>",
	cooldown: 5
};

module.exports.run = async function ({ api, event }) {
	try {
		let imageUrl;
		if (event.type === "message_reply" && event.messageReply.attachments.length > 0) {
			imageUrl = event.messageReply.attachments[0].url;
		} else if (event.attachments.length > 0) {
			imageUrl = event.attachments[0].url;
		} else {
			return api.sendMessage('𝗜 𝗰𝗮𝗻𝗻𝘁 𝘀𝗲𝗲 𝘁𝗵𝗲 𝗶𝗺𝗮𝗴𝗲. Please reply to an image 𝗳𝗼𝗿 𝗶𝘁 𝘁𝗼 𝘄𝗼𝗿𝗸', event.threadID, event.messageID);
		}

		const uploadUrl = 'https://apis-samir.onrender.com/upload';
		const data = { file: imageUrl };

		const response = await axios.post(uploadUrl, data, {
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			}
		});

		const result = response.data;

		if (result && result.image && result.image.url) {
			const cleanImageUrl = result.image.url.split('-')[0];
			api.sendMessage({ body: `${cleanImageUrl}.jpg` }, event.threadID);
		} else {
			api.sendMessage("Failed to upload the image to imgbb. 𝗦𝗼𝗼𝗻 𝗺𝘆 𝗼𝘄𝗻𝗲𝗿 𝘄𝗶𝗹𝗹 𝗳𝗶𝘅 𝗮𝗹𝗹 𝗲𝗿𝗿𝗼𝗿𝘀 𝗼𝗳 𝘁𝗵𝗶𝘀 𝗰𝗺𝗱 𝗱𝗼 𝗻𝗼𝘁 𝘄𝗼𝗿𝗿𝘆.", event.threadID);
		}
	} catch (error) {
		console.error('Error:', error);
		api.sendMessage(`Error: ${error.message}`, event.threadID);
	}
};
