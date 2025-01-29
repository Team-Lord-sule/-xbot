module.exports.config = {
    name: "balance",
    version: "1.0.2",
    hasPrefix: false,
    credits: "Jayden Smith",
    description: "Check your own or another user's balance",
    commandCategory: "economy",
    usages: "[Tag]",
    cooldowns: 5
};

module.exports.languages = {
    "vi": {
        "sotienbanthan": "Số tiền bạn đang có: %1$",
        "sotiennguoikhac": "Số tiền của %1 hiện đang có là: %2$"
    },
    "en": {
        "sotienbanthan": "Your current balance: %1$",
        "sotiennguoikhac": "%1's current balance: %2$."
    }
};

/**
 * Handles the balance command.
 * @param {Object} context - The context object containing API and event details.
 * @param {Object} context.api - The API object for interacting with the chat platform.
 * @param {Object} context.event - The event object containing details of the incoming message.
 * @param {Object} context.args - The command arguments.
 * @param {Object} context.Currencies - The Currencies object for handling currency data.
 * @param {Function} context.getText - The function to get localized text.
 */
module.exports.run = async function({ api, event, args, Currencies, getText }) {
    const { threadID, messageID, senderID, mentions } = event;

    try {
        // If no arguments, return the sender's balance
        if (!args[0]) {
            const money = (await Currencies.getData(senderID)).money;
            return api.sendMessage(getText("sotienbanthan", money), threadID);
        }

        // If one user is mentioned, return their balance
        if (Object.keys(mentions).length === 1) {
            const mentionID = Object.keys(mentions)[0];
            const mentionName = mentions[mentionID].replace(/@/g, "");
            let money = (await Currencies.getData(mentionID)).money;
            if (!money) money = 0;

            return api.sendMessage({
                body: getText("sotiennguoikhac", mentionName, money),
                mentions: [{
                    tag: mentionName,
                    id: mentionID
                }]
            }, threadID, messageID);
        }

        // If multiple users are mentioned, throw an error
        return global.utils.throwError(this.config.name, threadID, messageID);
    } catch (error) {
        console.error(`Error in ${this.config.name} command: `, error);
        return api.sendMessage("An error occurred while processing the command.", threadID, messageID);
    }
};
