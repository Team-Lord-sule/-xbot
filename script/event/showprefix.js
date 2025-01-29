// Language data for different locales
const langData = {
    "en_US": {
        "prefix.get": "Prefix is: {prefix}"
    },
    "vi_VN": {
        "prefix.get": "Prefix hiện tại là: {prefix}"
    }
};

/**
 * Handles the 'prefix' command to display the current prefix.
 * @param {Object} context - The context object containing message, getLang, and data.
 * @param {Object} context.message - The message object containing the details of the incoming message.
 * @param {Function} context.getLang - Function to get the localized string based on the key and parameters.
 * @param {Object} context.data - The data object containing thread and user data.
 */
function onCall({ message, getLang, data }) {
    // Check if the message body is 'prefix' and the sender is not the bot itself
    if (message.body.toLowerCase() === "prefix" && message.senderID !== global.botID) {
        const prefix = data?.thread?.data?.prefix || global.config.PREFIX;
        message.reply(getLang("prefix.get", { prefix }));
    }
}

/**
 * Module exports for the prefix event handler.
 */
export default {
    langData,
    onCall
};
