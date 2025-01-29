module.exports.config = {
    name: "admin",
    version: "1.0.5",
    hasPrefix: false,
    credits: "Lord King",
    description: "Manage bot admins",
    commandCategory: "config",
    usages: "[list/add/remove] [userID]",
    cooldowns: 5,
    dependencies: {
        "fs-extra": ""
    }
};

module.exports.languages = {
    "vi": {
        "listAdmin": '[Admin] Danh sách toàn bộ người điều hành bot: \n\n%1',
        "notHavePermssion": '[Admin] Bạn không đủ quyền hạn để có thể sử dụng chức năng "%1"',
        "addedNewAdmin": '[Admin] Đã thêm %1 người dùng trở thành người điều hành bot:\n\n%2',
        "removedAdmin": '[Admin] Đã gỡ bỏ %1 người điều hành bot:\n\n%2'
    },
    "en": {
        "listAdmin": '[Admin] Admin list: \n\n%1',
        "notHavePermssion": '[Admin] You have no permission to use "%1"',
        "addedNewAdmin": '[Admin] Added %1 Admin :\n\n%2',
        "removedAdmin": '[Admin] Removed %1 Admin:\n\n%2'
    }
};

/**
 * Runs the admin command.
 * @param {Object} context - The context object containing event and API details.
 * @param {Object} context.api - The API object for interacting with the chat platform.
 * @param {Object} context.event - The event object containing details of the incoming message.
 * @param {Object} context.args - The command arguments.
 * @param {Object} context.Users - The Users object for retrieving user data.
 * @param {number} context.permssion - The permission level of the user executing the command.
 * @param {Function} context.getText - The function to get localized text.
 */
module.exports.run = async function ({ api, event, args, Users, permssion, getText }) {
    const { threadID, messageID, mentions } = event;
    const { configPath } = global.client;
    const { ADMINBOT } = global.config;
    const { writeFileSync } = global.nodemodule["fs-extra"];
    const mention = Object.keys(mentions);

    // Load and refresh the config file
    delete require.cache[require.resolve(configPath)];
    const config = require(configPath);

    switch (args[0]) {
        case "list":
        case "all":
        case "-a":
            return listAdmins(api, getText, threadID, messageID);

        case "add":
            return addAdmin(api, event, args, permssion, Users, getText, mention, threadID, messageID, config, configPath);

        case "remove":
        case "rm":
        case "delete":
            return removeAdmin(api, event, args, permssion, Users, getText, mention, threadID, messageID, config, configPath);

        default:
            return global.utils.throwError(this.config.name, threadID, messageID);
    }
};

/**
 * List all admins.
 * @param {Object} api - The API object for interacting with the chat platform.
 * @param {Function} getText - The function to get localized text.
 * @param {string} threadID - The ID of the thread.
 * @param {string} messageID - The ID of the message.
 */
async function listAdmins(api, getText, threadID, messageID) {
    const { ADMINBOT } = global.config;
    const listAdmin = ADMINBOT || [];
    const msg = [];

    for (const idAdmin of listAdmin) {
        if (parseInt(idAdmin)) {
            const name = await Users.getNameUser(idAdmin);
            msg.push(`- ${name}(https://facebook.com/${idAdmin})`);
        }
    }

    return api.sendMessage(getText("listAdmin", msg.join("\n")), threadID, messageID);
}

/**
 * Add a new admin.
 * @param {Object} api - The API object for interacting with the chat platform.
 * @param {Object} event - The event object containing details of the incoming message.
 * @param {Array} args - The command arguments.
 * @param {number} permssion - The permission level of the user executing the command.
 * @param {Object} Users - The Users object for retrieving user data.
 * @param {Function} getText - The function to get localized text.
 * @param {Array} mention - The mentions in the message.
 * @param {string} threadID - The ID of the thread.
 * @param {string} messageID - The ID of the message.
 * @param {Object} config - The config object.
 * @param {string} configPath - The path to the config file.
 */
async function addAdmin(api, event, args, permssion, Users, getText, mention, threadID, messageID, config, configPath) {
    if (permssion !== 2) {
        return api.sendMessage(getText("notHavePermssion", "add"), threadID, messageID);
    }

    const { ADMINBOT } = global.config;
    const content = args.slice(1);
    const listAdd = [];

    if (mention.length !== 0 && isNaN(content[0])) {
        for (const id of mention) {
            ADMINBOT.push(id);
            config.ADMINBOT.push(id);
            listAdd.push(`[ ${id} ] » ${event.mentions[id]}`);
        }

        writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');
        return api.sendMessage(getText("addedNewAdmin", mention.length, listAdd.join("\n").replace(/\@/g, "")), threadID, messageID);
    } else if (content.length !== 0 && !isNaN(content[0])) {
        ADMINBOT.push(content[0]);
        config.ADMINBOT.push(content[0]);
        const name = await Users.getNameUser(content[0]);
        writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');
        return api.sendMessage(getText("addedNewAdmin", 1, `[ ${content[0]} ] » ${name}`), threadID, messageID);
    } else {
        return global.utils.throwError(this.config.name, threadID, messageID);
    }
}

/**
 * Remove an admin.
 * @param {Object} api - The API object for interacting with the chat platform.
 * @param {Object} event - The event object containing details of the incoming message.
 * @param {Array} args - The command arguments.
 * @param {number} permssion - The permission level of the user executing the command.
 * @param {Object} Users - The Users object for retrieving user data.
 * @param {Function} getText - The function to get localized text.
 * @param {Array} mention - The mentions in the message.
 * @param {string} threadID - The ID of the thread.
 * @param {string} messageID - The ID of the message.
 * @param {Object} config - The config object.
 * @param {string} configPath - The path to the config file.
 */
async function removeAdmin(api, event, args, permssion, Users, getText, mention, threadID, messageID, config, configPath) {
    if (permssion !== 2) {
        return api.sendMessage(getText("notHavePermssion", "delete"), threadID, messageID);
    }

    const { ADMINBOT } = global.config;
    const content = args.slice(1);
    const listRemove = [];

    if (mention.length !== 0 && isNaN(content[0])) {
        for (const id of mention) {
            const index = config.ADMINBOT.findIndex(item => item === id);
            if (index > -1) {
                ADMINBOT.splice(index, 1);
                config.ADMINBOT.splice(index, 1);
                listRemove.push(`[ ${id} ] » ${event.mentions[id]}`);
            }
        }

        writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');
        return api.sendMessage(getText("removedAdmin", mention.length, listRemove.join("\n").replace(/\@/g, "")), threadID, messageID);
    } else if (content.length !== 0 && !isNaN(content[0])) {
        const index = config.ADMINBOT.findIndex(item => item.toString() === content[0]);
        if (index > -1) {
            ADMINBOT.splice(index, 1);
            config.ADMINBOT.splice(index, 1);
            const name = await Users.getNameUser(content[0]);
            writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');
            return api.sendMessage(getText("removedAdmin", 1, `[ ${content[0]} ] » ${name}`), threadID, messageID);
        } else {
            return global.utils.throwError(this.config.name, threadID, messageID);
        }
    } else {
        return global.utils.throwError(this.config.name, threadID, messageID);
    }
}
