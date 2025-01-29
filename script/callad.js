module.exports.config = {
  name: "callad",
  version: "1.0.0",
  hasPrefix: false,
  credits: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭 || Jayden",
  description: "Report bug of your bot to admin or comment",
  commandCategory: "Admin",
  usages: "[msg]",
  cooldowns: 5,
};

const fs = require('fs-extra');
const { join } = require('path');
const axios = require('axios');
const moment = require("moment-timezone");
const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const charactersLength = characters.length || 20;

/**
 * Handles replies to the callad command.
 * @param {Object} context - The context object containing API and event details.
 * @param {Object} context.api - The API object for interacting with the chat platform.
 * @param {Object} context.event - The event object containing details of the incoming message.
 * @param {Object} context.handleReply - The handleReply object containing details of the original message.
 * @param {Object} context.Users - The Users object for retrieving user data.
 */
module.exports.handleReply = async function({ api, event, handleReply, Users }) {
  try {
    const name = (await Users.getData(event.senderID)).name;
    const attachments = await processAttachments(event.attachments);

    switch (handleReply.type) {
      case "reply":
        await sendFeedback(api, name, event.body, attachments, event.senderID);
        break;
      case "calladmin":
        await replyToFeedback(api, name, event.body, attachments, handleReply.messID);
        break;
    }
  } catch (error) {
    console.error("Error in handleReply:", error);
  }
};

/**
 * Runs the callad command.
 * @param {Object} context - The context object containing API and event details.
 * @param {Object} context.api - The API object for interacting with the chat platform.
 * @param {Object} context.event - The event object containing details of the incoming message.
 * @param {Object} context.Threads - The Threads object for retrieving thread data.
 * @param {Object} context.args - The command arguments.
 * @param {Object} context.Users - The Users object for retrieving user data.
 */
module.exports.run = async function({ api, event, Threads, args, Users }) {
  try {
    if (!args[0] && (!event.messageReply || event.messageReply.attachments.length === 0)) {
      return api.sendMessage("You haven't entered what to report 📋", event.threadID, event.messageID);
    }

    const name = (await Users.getData(event.senderID)).name;
    const idbox = event.threadID;
    const datathread = (await Threads.getData(event.threadID)).threadInfo;
    const namethread = datathread.threadName;
    const uid = event.senderID;
    const time = moment.tz("Asia/Manila").format("HH:mm:ss D/MM/YYYY");
    const attachments = await processAttachments(event.messageReply ? event.messageReply.attachments : []);

    await sendAdminReport(api, name, uid, namethread, idbox, args.join(" "), time, attachments, event.threadID, event.messageID);
  } catch (error) {
    console.error("Error in run:", error);
  }
};

/**
 * Processes the attachments of a message.
 * @param {Array} attachments - The attachments of the message.
 * @returns {Promise<Array>} - A promise that resolves to an array of file paths for the attachments.
 */
async function processAttachments(attachments) {
  const s = [];
  const l = [];

  if (attachments.length > 0) {
    for (const p of attachments) {
      const result = generateRandomString(charactersLength);
      const extension = getFileExtension(p.type);
      const filePath = join(__dirname, 'cache', `${result}.${extension}`);
      const fileData = (await axios.get(encodeURI(p.url), { responseType: "arraybuffer" })).data;

      fs.writeFileSync(filePath, Buffer.from(fileData, "utf-8"));
      s.push(filePath);
      l.push(fs.createReadStream(filePath));
    }
  }

  return { s, l };
}

/**
 * Sends feedback to the admin.
 * @param {Object} api - The API object for interacting with the chat platform.
 * @param {string} name - The name of the user sending the feedback.
 * @param {string} content - The content of the feedback.
 * @param {Object} attachments - The attachments of the feedback.
 * @param {string} senderID - The ID of the user sending the feedback.
 */
async function sendFeedback(api, name, content, attachments, senderID) {
  const adminIDs = global.config.ADMINBOT;

  for (const adminID of adminIDs) {
    await api.sendMessage({
      body: `[📲] Feedback from ${name}:\n${content || "There's no answer"}`,
      attachment: attachments.l,
      mentions: [{ id: senderID, tag: name }]
    }, adminID, (error, data) => {
      if (!error) {
        global.client.handleReply.push({
          name: module.exports.config.name,
          messageID: data.messageID,
          author: senderID,
          type: "calladmin"
        });
      }
    });

    attachments.s.forEach(filePath => fs.unlinkSync(filePath));
  }
}

/**
 * Replies to feedback.
 * @param {Object} api - The API object for interacting with the chat platform.
 * @param {string} name - The name of the admin replying to the feedback.
 * @param {string} content - The content of the reply.
 * @param {Object} attachments - The attachments of the reply.
 * @param {string} messageID - The ID of the original message.
 */
async function replyToFeedback(api, name, content, attachments, messageID) {
  await api.sendMessage({
    body: `[📌] Feedback from admin ${name}:\n\n${content || "no reply 🌸"}\n\n» Reply to this message if you want to continue sending reports.`,
    attachment: attachments.l
  }, messageID);

  attachments.s.forEach(filePath => fs.unlinkSync(filePath));
}

/**
 * Sends an admin report.
 * @param {Object} api - The API object for interacting with the chat platform.
 * @param {string} name - The name of the user sending the report.
 * @param {string} uid - The ID of the user sending the report.
 * @param {string} namethread - The name of the thread.
 * @param {string} idbox - The ID of the thread.
 * @param {string} content - The content of the report.
 * @param {string} time - The time the report was sent.
 * @param {Object} attachments - The attachments of the report.
 * @param {string} threadID - The ID of the thread.
 * @param {string} messageID - The ID of the message.
 */
async function sendAdminReport(api, name, uid, namethread, idbox, content, time, attachments, threadID, messageID) {
  const adminIDs = global.config.ADMINBOT;

  for (const adminID of adminIDs) {
    await api.sendMessage({
      body: `📱[ CALL ADMIN ]📱\n\n[👤] Report from: ${name}\n[❗] ID User: ${uid}\n[🗣️] BOX: ${namethread}\n[🔰] ID BOX: ${idbox}\n\n[💌] Inbox: ${content}\n[⏰] Time: ${time}`,
      attachment: attachments.l,
      mentions: [{ id: threadID, tag: name }]
    }, adminID, (error, info) => {
      if (!error) {
        global.client.handleReply.push({
          name: module.exports.config.name,
          messageID: info.messageID,
          author: threadID,
          messID: messageID,
          id: idbox,
          type: "calladmin"
        });
      }
    });

    attachments.s.forEach(filePath => fs.unlinkSync(filePath));
  }
}

/**
 * Generates a random string of the given length.
 * @param {number} length - The length of the string to generate.
 * @returns {string} - The generated string.
 */
function generateRandomString(length) {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

/**
 * Gets the file extension for the given attachment type.
 * @param {string} type - The type of the attachment.
 * @returns {string} - The file extension.
 */
function getFileExtension(type) {
  switch (type) {
    case 'photo':
      return 'jpg';
    case 'video':
      return 'mp4';
    case 'audio':
      return 'mp3';
    case 'animated_image':
      return 'gif';
    default:
      return 'bin';
  }
      }
