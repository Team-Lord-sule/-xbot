module.exports.config = {
    name: "auto-time",
    version: "1.2.0",
    hasPermssion: 0,
    credits: "Lord King",
    description: "Automatically Send Messages Based On Time With Attachment",
    commandCategory: "Utilities",
    usages: "Automatic",
    cooldowns: 5,
};

const messages = [
    {
        timer: '00:30:00', // 12:30 AM
        message: "──── •💜• ────\n⏳ समय: {currentTime}, दिन: {currentDay}, तारीख: {currentDate}\n" +
                 "रात के 11 बजे हैं।\nखाना खाया या अभी भी 'Netflix & No Food'? 😂\n──── •💜• ────"
    },
    {
        timer: '06:30:00', // 6:30 AM
        message: "──── •💜• ────\n⏳ समय: {currentTime}, दिन: {currentDay}, तारीख: {currentDate}\n" +
                 "गुड मॉर्निंग, बाबूजी! 🌅\nअरे उठो! सूरज चाचा पूछ रहे हैं: 'ये महाशय अब तक क्यों सो रहे हैं?' 😂\n──── •💜• ────"
    },
    {
        timer: '10:30:00', // 10:30 AM
        message: "──── •💜• ────\n⏳ समय: {currentTime}, दिन: {currentDay}, तारीख: {currentDate}\n" +
                 "नाश्ता कर लिया कि अभी भी 'मैं सोऊंगा थोड़ी देर और' मोड में हो? 🥪🤣\n──── •💜• ────"
    },
    {
        timer: '14:30:00', // 2:30 PM
        message: "──── •💜• ────\n⏳ समय: {currentTime}, दिन: {currentDay}, तारीख: {currentDate}\n" +
                 "लंच टाइम है!\nखाओ और पेट पूजा करो वरना दिमाग घूमेंगा! 🍛😅\n──── •💜• ────"
    },
    {
        timer: '17:30:00', // 5:30 PM
        message: "──── •💜• ────\n⏳ समय: {currentTime}, दिन: {currentDay}, तारीख: {currentDate}\n" +
                 "चाय का समय! ☕\nअरे कौन-कौन चायवाले को मिस कर रहा है? 😂\n──── •💜• ────"
    },
    {
        timer: '21:30:00', // 9:30 PM
        message: "──── •💜• ────\n⏳ समय: {currentTime}, दिन: {currentDay}, तारीख: {currentDate}\n" +
                 "डिनर का समय!\nखाना खा लो, और जल्दी सो जाओ वरना मम्मी चप्पल लेकर आएंगी! 😜\n──── •💜• ────"
    }
];

const videoLinks = [
    "",
    "https://i.imgur.com/sEpJtiQ.jpeg",
    "https://i.imgur.com/sEpJtiQ.jpeg"
];

/**
 * Initializes the auto-time module and sets up the interval to check and send messages.
 */
module.exports.onLoad = () => setInterval(() => {
    const getRandom = array => array[Math.floor(Math.random() * array.length)];
    const now = new Date();
    const currentTime = now.toTimeString().split(' ')[0];
    const currentDate = now.toLocaleDateString('en-IN'); // Using Indian locale for date
    const currentDay = now.toLocaleString('en-US', { weekday: 'long' });

    const selectedMessage = messages.find(entry => entry.timer === currentTime);

    if (selectedMessage) {
        const randomVideo = getRandom(videoLinks);
        const formattedMessage = selectedMessage.message
            .replace("{currentTime}", currentTime)
            .replace("{currentDate}", currentDate)
            .replace("{currentDay}", currentDay);

        global.data.allThreadID.forEach(threadID => {
            api.sendMessage({ body: formattedMessage, attachment: randomVideo }, threadID);
        });
    }
}, 1000);

/**
 * Placeholder run function.
 */
module.exports.run = () => {};
