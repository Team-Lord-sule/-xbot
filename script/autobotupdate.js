module.exports.config = {
    name: "autobotupdate",
    role: 0,
    credits: "Lord King",
    description: "Show the Autobot website and updates.",
    hasPrefix: false,
    usages: "{p}autobotupdate [words]",
    cooldown: 5,
    aliases: ["abup"]
};

module.exports.run = async function({ api, event }) {
    const ownerUid = "61560050885709"; // Owner's UID for permission check

    // Check if the user using the command is the owner
    if (event.senderID !== ownerUid) {
        api.sendMessage("You do not have permission to use this command.", event.threadID);
        return;
    }

    const autobotWebsite = "lord-auto.onrender.com";
    const updates = "New features added: Feature A, Feature B, Feature C";

    const autobotInfoString = `
    \n━━━━━━━━━━━━━━━━━━━━━━━━━━\n
    Autobot Website: ${autobotWebsite}
    Latest Updates: ${updates}
    \n━━━━━━━━━━━━━━━━━━━━━━━━━━\n
    `;

    api.sendMessage(autobotInfoString, event.threadID, event.messageID);
};
