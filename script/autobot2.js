module.exports.config = {
    name: "autobot2",
    role: 0,
    credits: "Lord King",
    description: "Get information about the autobot and the owner.",
    hasPrefix: false,
    usages: "{p}autobot2",
    cooldown: 5,
    aliases: ["creator"]
};

/**
 * Function to handle the autobot2 command.
 * @param {Object} context - The context object containing API and event details.
 * @param {Object} context.api - The API object for interacting with the chat platform.
 * @param {Object} context.event - The event object containing details of the incoming message.
 */
module.exports.run = async function({ api, event }) {
    const autobotInfo = {
        website: "lord-auto.onrender.com",
        owner: "Jayden Smith",
        ownerInfo: {
            name: "Lord King",
            facebook: "https://www.facebook.com/lordjaydenSmith.1",
            github: "lord2s",
            telegram: "@lordjaydenSmith",
            age: "22",
            status: "Active"
        }
    };

    const { website, owner, ownerInfo } = autobotInfo;
    const { name, facebook, github, telegram, age, status } = ownerInfo;

    // Constructing the autobot information message
    const autobotInfoString = `
        \n━━━━━━━━━━━━━━━━━━━━━━━━━━\n
        𝗔𝘂𝘁𝗼𝗯𝗼𝘁 𝗪𝗲𝗯𝘀𝗶𝘁𝗲: ${website}
        𝗢𝘄𝗻𝗲𝗿: ${owner}
        𝗡𝗮𝗺𝗲: ${name}
        𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸: ${facebook}
        𝗚𝗶𝘁𝗵𝘂𝗯: ${github}
        𝗧𝗲𝗹𝗲𝗴𝗿𝗮𝗺: ${telegram}
        𝗔𝗴𝗲: ${age}
        𝗦𝘁𝗮𝘁𝘂𝘀: ${status}
        \n━━━━━━━━━━━━━━━━━━━━━━━━━━\n
    `;

    // Sending the message with autobot information
    api.sendMessage(autobotInfoString, event.threadID, event.messageID);
};
