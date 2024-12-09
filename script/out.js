module.exports.config = {
  name: "out",
  version: "1.0.0",
  role: 2,
  hasPrefix: true,
  credits: "𝗝𝗮𝘆 𝗹𝗼𝗿𝗱",
  description: "Bot leaves the thread",
  usages: "out",
  cooldowns: 10,

};

module.exports.run = async function({ api, event, args }) {
  try { 
  if (!args[0]) return api.removeUserFromGroup(api.getCurrentUserID(), event.threadID);
  if (!isNaN(args[0])) return api.removeUserFromGroup(api.getCurrentUserID(), args.join("𝗢𝗛𝗛 𝗡𝗢 𝗠𝗬 𝗗𝗘𝗩𝗘𝗟𝗢𝗣𝗘𝗥 𝗔𝗦𝗞𝗘𝗗 𝗠𝗘 𝗧𝗢 𝗟𝗘𝗔𝗩𝗘 𝗧𝗛𝗘 𝗚𝗥𝗢𝗨𝗣 𝗦𝗢 𝗚𝗢𝗢𝗗 𝗕𝗬𝗘 𝗘𝗩𝗘𝗥𝗬𝗢𝗡𝗘 ⊂(・﹏・⊂)."));
    } catch (error) {
      api.sendMessage(error.message, event.threadID, event.messageID);
    }
};
