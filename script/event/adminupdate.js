module.exports.config = {
    name: "adminUpdate",
    eventType: ["log:thread-admins", "log:thread-name", "log:user-nickname", "log:thread-icon", "log:thread-color"],
    version: "1.0.2",
    credits: "lord junior",
    description: "Update team information quickly",
    envConfig: {
        sendNoti: true,
        autoUnsend: false,
        timeToUnsend: 30 // Time in seconds before auto unsend
    }
};

module.exports.run = async function ({ event, api, Threads, Users }) {
    const fs = require("fs");
    const path = require("path");
    const iconPath = path.join(__dirname, "emoji.json");
    const { threadID, logMessageType, logMessageData } = event;
    const { setData, getData } = Threads;

    if (!fs.existsSync(iconPath)) fs.writeFileSync(iconPath, JSON.stringify({}));

    const thread = global.data.threadData.get(threadID) || {};
    if (thread["adminUpdate"] === false) return;

    try {
        let dataThread = (await getData(threadID)).threadInfo;
        switch (logMessageType) {
            case "log:thread-admins":
                handleThreadAdmins(logMessageData, dataThread, api, threadID);
                break;
            case "log:thread-icon":
                handleThreadIcon(logMessageData, dataThread, api, threadID, iconPath);
                break;
            case "log:thread-color":
                handleThreadColor(logMessageData, dataThread, api, threadID);
                break;
            case "log:user-nickname":
                handleUserNickname(logMessageData, dataThread, api, threadID);
                break;
            case "log:thread-name":
                handleThreadName(logMessageData, dataThread, api, threadID);
                break;
        }
        await setData(threadID, { threadInfo: dataThread });
    } catch (e) {
        console.log(e);
    }
};

async function handleThreadAdmins(logMessageData, dataThread, api, threadID) {
    if (logMessageData.ADMIN_EVENT === "add_admin") {
        dataThread.adminIDs.push({ id: logMessageData.TARGET_ID });
        sendNotification(api, threadID, `»» NOTICE «« Update user ${logMessageData.TARGET_ID} Mil Gya Admin Tujhe Ja Khus Hoja 😸`);
    } else if (logMessageData.ADMIN_EVENT === "remove_admin") {
        dataThread.adminIDs = dataThread.adminIDs.filter(item => item.id !== logMessageData.TARGET_ID);
        sendNotification(api, threadID, `»» NOTICE «« Update user ${logMessageData.TARGET_ID} Ha Bhai Agaya Swad Tu Admin Rehne Ke Layak Ni Tha 😹`);
    }
}

async function handleThreadIcon(logMessageData, dataThread, api, threadID, iconPath) {
    let preIcon = JSON.parse(fs.readFileSync(iconPath));
    dataThread.threadIcon = logMessageData.thread_icon || "👍";
    sendNotification(api, threadID, `» [ GROUP UPDATE ]\n» New icon: ${dataThread.threadIcon}\n» Original icon: ${preIcon[threadID] || "unknown"}`);
    preIcon[threadID] = dataThread.threadIcon;
    fs.writeFileSync(iconPath, JSON.stringify(preIcon));
}

async function handleThreadColor(logMessageData, dataThread, api, threadID) {
    dataThread.threadColor = logMessageData.thread_color || "🌤";
    sendNotification(api, threadID, `» [ GROUP UPDATE ]\n» New color: ${dataThread.threadColor}`);
}

async function handleUserNickname(logMessageData, dataThread, api, threadID) {
    dataThread.nicknames[logMessageData.participant_id] = logMessageData.nickname;
    sendNotification(api, threadID, `»» NOTICE «« Update user nicknames ${logMessageData.participant_id} to: ${logMessageData.nickname || "[removed]"}`);
}

async function handleThreadName(logMessageData, dataThread, api, threadID) {
    dataThread.threadName = logMessageData.name || "No name";
    sendNotification(api, threadID, `»» NOTICE «« Update the group name to ${dataThread.threadName}`);
}

async function sendNotification(api, threadID, message) {
    if (global.configModule[module.exports.config.name].sendNoti) {
        const info = await api.sendMessage(message, threadID);
        if (global.configModule[module.exports.config.name].autoUnsend) {
            await new Promise(resolve => setTimeout(resolve, global.configModule[module.exports.config.name].timeToUnsend * 1000));
            return api.unsendMessage(info.messageID);
        }
    }
}
