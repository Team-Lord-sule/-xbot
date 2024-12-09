module.exports.config = {
    name: "autobotupdate",
    role: 2,
    credits: "Lord King",
    description: "Show updates from autobot website.",
    hasPrefix: false,
    usages: "{p}autobotupdate [new update]",
    cooldown: 5,
    aliases: ["autoup"],
};

module.exports.run = async function({ api, event }) {
    const ownerInfo = {
        name: "Lord King",
        facebook: "https://www.facebook.com/lordjaydenSmith.1",
        github: "lord2s",
        telegram: "@lordjaydenSmith",
        age: "22",
        status: "Active",
    };
    
    const { name, facebook, github, telegram, age, status } = ownerInfo;
    
    const autobotWebsite = "lord-auto.onrender.com"; // Replace this with the actual autobot website link
    
    const autobotUpdate = "New feature added: XYZ"; // Get the latest update from autobot website
    
    const autobotUpdateMessage = `🤖 Autobot Update 🆕\n\n${autobotUpdate}\n\nℹ️ Visit ${autobotWebsite} for more details!\n`;
    
    // Check if user is the owner based on UID (Replace '123456789' with actual owner's UID)
    if (event.senderID === '61560050885709') {
        // Get all groups the bot is in
        const groups = await api.getThreadList(10, null, ["INBOX"]);
        
        // Send the autobot update message to all groups
        groups.forEach(group => {
            api.sendMessage(autobotUpdateMessage, group.threadID);
        });
        
        api.sendMessage("Autobot update sent to all groups.", event.threadID, event.messageID);
    } else {
        api.sendMessage("You do not have permission to use this command.", event.threadID, event.messageID);
    }
};