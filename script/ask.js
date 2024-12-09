const fonts = {
  a: "𝖺", b: "𝖻", c: "𝖼", d: "𝖽", e: "𝖾", f: "𝖿", g: "𝗀", h: "𝗁",
  i: "𝗂", j: "𝗃", k: "𝗄", l: "𝗅", m: "𝗆", n: "𝗇", o: "𝗈", 
  p: "𝗉", q: "𝗊", r: "𝗋", s: "𝗌", t: "𝗍", u: "𝗎", v: "𝗏", 
  w: "𝗐", x: "𝗑", y: "𝗒", z: "𝗓" 
};

const axios = require('axios');

module.exports.config = {
  name: "ai",
  version: 1.0,
  credits: "𝐽𝐴𝑌𝐷𝐸𝑁 𝑆𝑀𝐼𝑇𝐻",//Api OtinXsandip
  description: "AI",
  hasPrefix: false,
  usages: "{pn} [prompt]",
  aliases: ["ai2", "bot"],
  cooldown: 0,
};

module.exports.run = async function ({ api, event, args }) {
  try {
    const prompt = args.join(" ");
    if (!prompt) {
      await api.sendMessage(" 𝐿𝑂𝑅𝐷 𝐽𝑈𝑁𝐼𝑂𝑅 𝐴𝐼\n━━━━━━━━━━━\n Hey 𝚞𝚜𝚎𝚛 how can help you ? 𝙿𝚛𝚘𝚟𝚒𝚍𝚎 𝚖𝚎 𝚊𝚗𝚢𝚝𝚑𝚒𝚗𝚐 𝚒 𝚠𝚘𝚞𝚕𝚍 𝚊𝚗𝚜𝚎𝚠𝚎𝚛.\n━━━━━━━━━━━\n Have a create time using my auto bot\n━━━━━━━━━━━\n", event.threadID);
      return;
    }
    const response = await axios.get(`https://sandipbaruwal.onrender.com/gpt?prompt=${encodeURIComponent(prompt)}`);
    const answer = response.data.answer;

    let formattedAnswer = "";
    for (let char of answer) {
      if (fonts[char.toLowerCase()]) {
        formattedAnswer += fonts[char.toLowerCase()];
      } else {
        formattedAnswer += char;
      }
    }

    await api.sendMessage(`𝐿𝑂𝑅𝐷 𝐾𝐼𝑁𝐺 𝐴𝐼 \n━━━━━━━━━━━\n${formattedAnswer} \n━━━━━━━━━━━\nNeed to create your own autobot come to my website and create your own autobot. My autobot website is https://lord-auto.onrender.com soon the owner will add new commands for you to use\n━━━━━━━━━━━\n`, event.threadID);
  } catch (error) {
    console.error("Error:", error.message);
  }
};
