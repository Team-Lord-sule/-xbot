module.exports.config = {
    config: {
        name: "autoUpdateThreadInfo",
        version: "1.4",
    },

    /**
     * Event handler for auto-updating thread information based on various log types.
     * @param {Object} context - The context object containing threadsData, event, and api.
     * @param {Object} context.threadsData - The threads data management object.
     * @param {Object} context.event - The event object containing details of the log event.
     * @param {Object} context.api - The API object for interacting with the chat platform.
     */
    onStart: async ({ threadsData, event, api }) => {
        const types = [
            "log:subscribe", "log:unsubscribe", "log:thread-admins",
            "log:thread-name", "log:thread-image", "log:thread-icon",
            "log:thread-color", "log:user-nickname"
        ];

        if (!types.includes(event.logMessageType)) {
            return;
        }

        const { threadID, logMessageData, logMessageType } = event;
        const threadInfo = await threadsData.get(threadID);
        let { members, adminIDs } = threadInfo;

        switch (logMessageType) {
            case "log:subscribe":
                return handleSubscribe({ event, api, threadsData, threadID, members });
            
            case "log:unsubscribe":
                return handleUnsubscribe({ logMessageData, threadsData, threadID, members });

            case "log:thread-admins":
                return handleThreadAdmins({ logMessageData, threadsData, threadID, adminIDs });

            case "log:thread-name":
                return handleThreadName({ logMessageData, threadsData, threadID });

            case "log:thread-image":
                return handleThreadImage({ logMessageData, threadsData, threadID });

            case "log:thread-icon":
                return handleThreadIcon({ logMessageData, threadsData, threadID });

            case "log:thread-color":
                return handleThreadColor({ logMessageData, threadsData, threadID });

            case "log:user-nickname":
                return handleUserNickname({ logMessageData, threadsData, threadID, members });

            default:
                return null;
        }
    }
};

/**
 * Handle 'log:subscribe' event to update thread members.
 */
async function handleSubscribe({ event, api, threadsData, threadID, members }) {
    const { addedParticipants } = event.logMessageData;
    const threadInfo_Fca = await api.getThreadInfo(threadID);
    threadsData.refreshInfo(threadID, threadInfo_Fca);

    for (const user of addedParticipants) {
        let oldData = members.find(member => member.userID === user.userFbId);
        const isOldMember = !!oldData;
        oldData = oldData || {};
        const { userInfo, nicknames } = threadInfo_Fca;

        const newData = {
            userID: user.userFbId,
            name: user.fullName,
            gender: userInfo.find(u => u.id == user.userFbId)?.gender,
            nickname: nicknames[user.userFbId] || null,
            inGroup: true,
            count: oldData.count || 0
        };

        if (!isOldMember) {
            members.push(newData);
        } else {
            const index = members.findIndex(member => member.userID === user.userFbId);
            members[index] = newData;
        }
    }
    await threadsData.set(threadID, members, "members");
}

/**
 * Handle 'log:unsubscribe' event to update thread members.
 */
async function handleUnsubscribe({ logMessageData, threadsData, threadID, members }) {
    const oldData = members.find(member => member.userID === logMessageData.leftParticipantFbId);
    if (oldData) {
        oldData.inGroup = false;
        await threadsData.set(threadID, members, "members");
    }
}

/**
 * Handle 'log:thread-admins' event to update thread admin IDs.
 */
async function handleThreadAdmins({ logMessageData, threadsData, threadID, adminIDs }) {
    if (logMessageData.ADMIN_EVENT === "add_admin") {
        adminIDs.push(logMessageData.TARGET_ID);
    } else {
        adminIDs = adminIDs.filter(uid => uid !== logMessageData.TARGET_ID);
    }
    adminIDs = [...new Set(adminIDs)]; // Remove duplicates
    await threadsData.set(threadID, adminIDs, "adminIDs");
}

/**
 * Handle 'log:thread-name' event to update thread name.
 */
async function handleThreadName({ logMessageData, threadsData, threadID }) {
    const threadName = logMessageData.name;
    await threadsData.set(threadID, threadName, "threadName");
}

/**
 * Handle 'log:thread-image' event to update thread image.
 */
async function handleThreadImage({ logMessageData, threadsData, threadID }) {
    await threadsData.set(threadID, logMessageData.url, "imageSrc");
}

/**
 * Handle 'log:thread-icon' event to update thread icon.
 */
async function handleThreadIcon({ logMessageData, threadsData, threadID }) {
    await threadsData.set(threadID, logMessageData.thread_icon, "emoji");
}

/**
 * Handle 'log:thread-color' event to update thread color.
 */
async function handleThreadColor({ logMessageData, threadsData, threadID }) {
    await threadsData.set(threadID, logMessageData.theme_id, "threadThemeID");
}

/**
 * Handle 'log:user-nickname' event to update user nickname.
 */
async function handleUserNickname({ logMessageData, threadsData, threadID, members }) {
    const { participant_id, nickname } = logMessageData;
    const oldData = members.find(member => member.userID === participant_id);
    if (oldData) {
        oldData.nickname = nickname;
        await threadsData.set(threadID, members, "members");
    }
}
