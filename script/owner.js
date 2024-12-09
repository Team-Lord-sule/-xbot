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
        age: "22",
        status: "Active",
    };

    const { name, facebook, github, telegram, age, status } = ownerInfo;

    const ownerInfoString = `
    \n━━━━━━━━━━━━━━━━━━━━━━━━━━\n
        𝗡𝗮𝗺𝗲: ${name}
        𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸: ${facebook}
        𝗚𝗶𝘁𝗵𝘂𝗯: ${github}
        𝗧𝗲𝗹𝗲𝗴𝗿𝗮𝗺: ${telegram}
        𝗔𝗴𝗲: ${age}
        𝗦𝘁𝗮𝘁𝘂𝘀: ${status}
    \n━━━━━━━━━━━━━━━━━━━━━━━━━━\n
    `;

    api.sendMessage(ownerInfoString, event.threadID, event.messageID);
};
 
