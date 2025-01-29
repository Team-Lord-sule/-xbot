module.exports.config = {
    name: "daily",
    version: "1.0.2",
    hasPrefix: false,
    credits: "Jayden smith",
    description: "Receive 200 coins daily!",
    commandCategory: "economy",
    cooldowns: 5,
    envConfig: {
        cooldownTime: 14400000, // 4 hours in milliseconds
        rewardCoin: 2000
    }
};

module.exports.languages = {
    "vi": {
        "cooldown": "Bạn đang trong thời gian chờ\nVui lòng thử lại sau: %1 giờ %2 phút %3 giây!",
        "rewarded": "Bạn đã nhận %1$, để có thể tiếp tục nhận, vui lòng quay lại sau 12 tiếng"
    },
    "en": {
        "cooldown": "You received today's rewards, please come back after: %1 hours %2 minutes %3 seconds.",
        "rewarded": "You received %1$, to continue to receive, please try again after 12 hours"
    }
};

/**
 * Runs the daily command.
 * @param {Object} context - The context object containing event and API details.
 * @param {Object} context.event - The event object containing details of the incoming message.
 * @param {Object} context.api - The API object for interacting with the chat platform.
 * @param {Object} context.Currencies - The Currencies object for handling currency data.
 * @param {Function} context.getText - The function to get localized text.
 */
module.exports.run = async ({ event, api, Currencies, getText }) => {
    const { daily } = global.configModule;
    const { cooldownTime, rewardCoin } = daily;
    const { senderID, threadID } = event;

    try {
        let data = (await Currencies.getData(senderID)).data || {};
        const lastClaimTime = data.dailyCoolDown || 0;
        const currentTime = Date.now();
        const timeDifference = currentTime - lastClaimTime;

        if (timeDifference < cooldownTime) {
            const remainingTime = cooldownTime - timeDifference;
            const hours = Math.floor(remainingTime / (1000 * 60 * 60));
            const minutes = Math.floor((remainingTime / (1000 * 60)) % 60);
            const seconds = Math.floor((remainingTime / 1000) % 60);
            const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;

            return api.sendMessage(getText("cooldown", hours, minutes, formattedSeconds), threadID);
        } else {
            await Currencies.increaseMoney(senderID, rewardCoin);
            data.dailyCoolDown = currentTime;
            await Currencies.setData(senderID, { data });

            return api.sendMessage(getText("rewarded", rewardCoin), threadID);
        }
    } catch (error) {
        console.error(`Error in daily command: ${error}`);
        return api.sendMessage("An error occurred while processing your request. Please try again later.", threadID);
    }
};
