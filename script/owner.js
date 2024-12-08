module.exports.config = {
    name: "owner",
    role: 0,
    credits: "Lord King",
    description: "Get information about the owner.",
    hasPrefix: false,
    usages: "{p}owner",
    cooldown: 5,
    aliases: ["creator"]
};

module.exports.run = async function({ api, event }) {
    const ownerInfo = {
        name: "Lord King",
        facebook: "https://www.facebook.com/lordjaydenSmith.1",
        github: "lord2s",
        telegram: "@lordjaydenSmith",
        age: "22"
    };

    const { name, facebook, github, telegram, age } = ownerInfo;

    const ownerInfoString = `
    Name: ${name}
    Facebook: ${facebook}
    GitHub: ${github}
    Telegram: ${telegram}
    Age: ${age}
    `;

    api.sendMessage(ownerInfoString, event.threadID, event.messageID);
};
 
