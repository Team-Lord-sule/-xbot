const fs = require('fs');
const path = require('path');
const login = require('./fb-chat-api/index');
const express = require('express');
const app = express();
const chalk = require('chalk');
const bodyParser = require('body-parser');
const axios = require('axios');
const script = path.join(__dirname, 'script');
const moment = require("moment-timezone");
const cron = require('node-cron');
const config = fs.existsSync('./data') && fs.existsSync('./data/config.json') ? JSON.parse(fs.readFileSync('./data/config.json', 'utf8')) : createConfig();
const Utils = {
  commands: new Map(),
  handleEvent: new Map(),
  account: new Map(),
  cooldowns: new Map(),
};

fs.readdirSync(script).forEach((file) => {
  const scripts = path.join(script, file);
  const stats = fs.statSync(scripts);
  if (stats.isDirectory()) {
    fs.readdirSync(scripts).forEach((file) => {
      loadScript(scripts, file);
    });
  } else {
    loadScript(script, file);
  }
});

function loadScript(directory, file) {
  try {
    const { config, run, handleEvent } = require(path.join(directory, file));
    if (config) {
      const {
        name = [], role = '0', version = '1.0.0', hasPrefix = true, aliases = [], description = '', usage = '', credits = '', cooldown = '5'
      } = Object.fromEntries(Object.entries(config).map(([key, value]) => [key.toLowerCase(), value]));
      aliases.push(name);
      if (run) {
        Utils.commands.set(aliases, { name, role, run, aliases, description, usage, version, hasPrefix, credits, cooldown });
      }
      if (handleEvent) {
        Utils.handleEvent.set(aliases, { name, handleEvent, role, description, usage, version, hasPrefix, credits, cooldown });
      }
    }
  } catch (error) {
    console.error(chalk.red(`Error loading script from file ${file}: ${error.message}`));
  }
}

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(express.json());

const routes = [
  { path: '/', file: 'index.html' },
  { path: '/step_by_step_guide', file: 'guide.html' },
  { path: '/online_user', file: 'online.html' },
  { path: '/contact', file: 'contact.html' },
  { path: '/random_shoti', file: 'shoti.html' },
  { path: '/analog', file: 'analog.html' },
  { path: '/clock', file: 'clock.html' },
  { path: '/time', file: 'crazy.html' },
  { path: '/developer', file: 'developer.html' },
  { path: '/random', file: 'random.html' },
];

routes.forEach(route => {
  app.get(route.path, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', route.file));
  });
});

app.get('/info', (req, res) => {
  const data = Array.from(Utils.account.values()).map(account => ({
    name: account.name,
    profileUrl: account.profileUrl,
    thumbSrc: account.thumbSrc,
    time: account.time,
  }));
  res.json(data);
});

app.get('/commands', (req, res) => {
  const commandSet = new Set();
  const commands = [...Utils.commands.values()].map(({ name }) => (commandSet.add(name), name));
  const handleEvent = [...Utils.handleEvent.values()].map(({ name }) => commandSet.has(name) ? null : (commandSet.add(name), name)).filter(Boolean);
  const role = [...Utils.commands.values()].map(({ role }) => (commandSet.add(role), role));
  const aliases = [...Utils.commands.values()].map(({ aliases }) => (commandSet.add(aliases), aliases));
  res.json({ commands, handleEvent, role, aliases });
});

app.post('/login', async (req, res) => {
  const { state, commands, prefix, admin } = req.body;
  if (!state) {
    return res.status(400).json({ error: true, message: 'Missing app state data' });
  }
  const cUser = state.find(item => item.key === 'c_user');
  if (cUser) {
    const existingUser = Utils.account.get(cUser.value);
    if (existingUser) {
      console.log(`User ${cUser.value} is already logged in`);
      return res.status(400).json({ error: false, message: "Active user session detected; already logged in", user: existingUser });
    }
    try {
      await accountLogin(state, commands, prefix, [admin]);
      res.status(200).json({ success: true, message: 'Authentication process completed successfully; login achieved.' });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: true, message: error.message });
    }
  } else {
    res.status(400).json({ error: true, message: "There's an issue with the app state data; it's invalid." });
  }
});

const accessToken = process.env.ACCESS_TOKEN;
if (!accessToken) {
  console.error('Access token is missing. Please set ACCESS_TOKEN in your environment variables.');
  process.exit(1);
}

const videoUrls = [
  { url: 'https://drive.google.com/uc?export=download&id=1JJwwQDPrHMKzLQq_AYHvlMNLjD-kTIMO', caption: "It's 1:00 PM, Time flies very fast. Don't forget to follow my account {https://www.facebook.com/profile.php?id=100053549552408}[autopost]" },
  { url: 'https://drive.google.com/uc?export=download&id=1BMvettog6cRZDSYs1U-l5yvrRwwuNepo', caption: "It's 3:00 PM, and here's another video[DO NOT SEARCH THE ENGLISH TRANSLATION OF THIS ONE] and don't forget to follow my main account =>{https://www.facebook.com/profile.php?id=100053549552408}[autopost]" },
  { url: 'https://drive.google.com/uc?export=download&id=1d6UqhZfVRilC56Dun0L13QJmpwrFlaSH', caption: "IT'S 6:30PM => She's living her life with a new guy, creating new memories and forging a path toward a future that doesn't include me. Meanwhile, I find myself trapped in the shadow..." }
];

videoUrls.forEach((video, index) => {
  cron.schedule(`0 ${video.schedule} * * *`, () => {
    autopostWithVideo(index);
  });
});

async function autopostWithVideo(index) {
  const { url, caption } = videoUrls[index];
  const videoData = {
    access_token: accessToken,
    file_url: url,
    description: caption,
  };

  try {
    const videoResponse = await axios.post('https://graph-video.facebook.com/me/videos', videoData);
    if (videoResponse.status === 200 && videoResponse.data.id) {
      const videoId = videoResponse.data.id;
      const postData = {
        attached_media: [{ media_fbid: videoId }],
        access_token: accessToken,
      };

      const response = await axios.post('https://graph.facebook.com/me/feed', postData);
      console.log(response.status === 200 ? `Posted video to your timeline successfully.` : `Failed to post video to your timeline.`);
    } else {
      console.error('Failed to upload the video.');
    }
  } catch (error) {
    console.error(`Error posting video to timeline:`, error.response.data);
  }
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Promise Rejection:', reason);
});

async function accountLogin(state, enableCommands = [], prefix, admin = []) {
  return new Promise((resolve, reject) => {
    login({ appState: state }, async (error, api) => {
      if (error) {
        reject(error);
        return;
      }
      const userid = await api.getCurrentUserID();
      addThisUser(userid, enableCommands, state, prefix, admin);
      try {
        const userInfo = await api.getUserInfo(userid);
        if (!userInfo || !userInfo[userid]?.name || !userInfo[userid]?.profileUrl || !userInfo[userid]?.thumbSrc) {
          throw new Error('Unable to locate the account; it appears to be suspended or locked.');
        }
        const { name, profileUrl, thumbSrc } = userInfo[userid];
        let time = (JSON.parse(fs.readFileSync('./data/history.json', 'utf-8')).find(user => user.userid === userid) || {}).time || 0;
        Utils.account.set(userid, { name, profileUrl, thumbSrc, time });

        const intervalId = setInterval(() => {
          try {
            const account = Utils.account.get(userid);
            if (!account) throw new Error('Account not found');
            Utils.account.set(userid, { ...account, time: account.time + 1 });
          } catch (error) {
            clearInterval(intervalId);
          }
        }, 1000);
      } catch (error) {
        reject(error);
        return;
      }

      api.setOptions({
        listenEvents: config[0].fcaOption.listenEvents,
        logLevel: config[0].fcaOption.logLevel,
        updatePresence: config[0].fcaOption.updatePresence,
        selfListen: config[0].fcaOption.selfListen,
        forceLogin: config[0].fcaOption.forceLogin,
        online: config[0].fcaOption.online,
        autoMarkDelivery: config[0].fcaOption.autoMarkDelivery,
        autoMarkRead: config[0].fcaOption.autoMarkRead,
      });

      try {
        var listenEmitter = api.listenMqtt(async (error, event) => {
          if (error) {
            if (error === 'Connection closed.') {
              console.error(`Error during API listen: ${error}`, userid);
            }
            console.log(error);
          }
          let database = fs.existsSync('./data/database.json') ? JSON.parse(fs.readFileSync('./data/database.json', 'utf8')) : createDatabase();
          let data = Array.isArray(database) ? database.find(item => Object.keys(item)[0] === event?.threadID) : {};
          let adminIDS = data ? database : createThread(event.threadID, api);
          let blacklist = (JSON.parse(fs.readFileSync('./data/history.json', 'utf-8')).find(blacklist => blacklist.userid === userid) || {}).blacklist || [];
          let hasPrefix = (event.body && aliases((event.body || '')?.trim().toLowerCase().split(/ +/).shift())?.hasPrefix == false) ? '' : prefix;
          let [command, ...args] = ((event.body || '').trim().toLowerCase().startsWith(hasPrefix?.toLowerCase()) ? (event.body || '').trim().substring(hasPrefix?.length).trim().split(/\s+/).map(arg => arg.toLowerCase()) : ['', '']);

          handleEvent({ event, command, args, api, userid, prefix, blacklist, adminIDS, enableCommands, hasPrefix });
        });
      } catch (error) {
        console.error('Error during API listen, outside of listen', userid);
        Utils.account.delete(userid);
        deleteThisUser(userid);
        return;
      }
      resolve();
    });
  });
}

async function deleteThisUser(userid) {
  const configFile = './data/history.json';
  let config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
  const sessionFile = path.join('./data/session', `${userid}.json`);
  const index = config.findIndex(item => item.userid === userid);
  if (index !== -1) config.splice(index, 1);
  fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
  try {
    fs.unlinkSync(sessionFile);
  } catch (error) {
    console.error(error);
  }
}

async function addThisUser(userid, enableCommands, state, prefix, admin, blacklist) {
  const configFile = './data/history.json';
  const sessionFolder = './data/session';
  const sessionFile = path.join(sessionFolder, `${userid}.json`);
  if (fs.existsSync(sessionFile)) return;
  const config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
  config.push({ userid, prefix: prefix || "", admin: admin || [], blacklist: blacklist || [], enableCommands, time: 0 });
  fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
  fs.writeFileSync(sessionFile, JSON.stringify(state));
}

function aliases(command) {
  return Array.from(Utils.commands.entries()).find(([commands]) => commands.includes(command?.toLowerCase()))?.[1] || null;
}

async function main() {
  const empty = require('fs-extra');
  const cacheFile = './script/cache';
  if (!fs.existsSync(cacheFile)) fs.mkdirSync(cacheFile);
  const configFile = './data/history.json';
  if (!fs.existsSync(configFile)) fs.writeFileSync(configFile, '[]', 'utf-8');
  const config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
  const sessionFolder = path.join('./data/session');
  if (!fs.existsSync(sessionFolder)) fs.mkdirSync(sessionFolder);
  const adminOfConfig = fs.existsSync('./data') && fs.existsSync('./data/config.json') ? JSON.parse(fs.readFileSync('./data/config.json', 'utf8')) : createConfig();
  cron.schedule(`*/${adminOfConfig[0].masterKey.restartTime} * * * *`, async () => {
    const history = JSON.parse(fs.readFileSync('./data/history.json', 'utf-8'));
    history.forEach(user => {
      (!user || typeof user !== 'object') ? process.exit(1) : null;
      (user.time === undefined || user.time === null || isNaN(user.time)) ? process.exit(1) : null;
      const update = Utils.account.get(user.userid);
      if (update) user.time = update.time;
    });
    await empty.emptyDir(cacheFile);
    fs.writeFileSync('./data/history.json', JSON.stringify(history, null, 2));
    process.exit(1);
  });

  try {
    for (const file of fs.readdirSync(sessionFolder)) {
      const filePath = path.join(sessionFolder, file);
      try {
        const { enableCommands, prefix, admin, blacklist } = config.find(item => item.userid === path.parse(file).name) || {};
        const state = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        if (enableCommands) await accountLogin(state, enableCommands, prefix, admin, blacklist);
      } catch (error) {
        deleteThisUser(path.parse(file).name);
      }
    }
  } catch (error) {
    console.error(error);
  }
}

function createConfig() {
  const config = [{
    masterKey: { admin: [], devMode: false, database: false, restartTime: 9999999 },
    fcaOption: {
      forceLogin: true,
      listenEvents: true,
      logLevel: "silent",
      updatePresence: true,
      selfListen: false,
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64",
      online: true,
      autoMarkDelivery: false,
      autoMarkRead: false,
    }
  }];
  const dataFolder = './data';
  if (!fs.existsSync(dataFolder)) fs.mkdirSync(dataFolder);
  fs.writeFileSync('./data/config.json', JSON.stringify(config, null, 2));
  return config;
}

async function createThread(threadID, api) {
  try {
    const database = JSON.parse(fs.readFileSync('./data/database.json', 'utf8'));
    let threadInfo = await api.getThreadInfo(threadID);
    let adminIDs = threadInfo ? threadInfo.adminIDs : [];
    const data = {};
    data[threadID] = adminIDs;
    database.push(data);
    fs.writeFileSync('./data/database.json', JSON.stringify(database, null, 2), 'utf-8');
    return database;
  } catch (error) {
    console.error(error);
  }
}

async function createDatabase() {
  const data = './data';
  const database = './data/database.json';
  if (!fs.existsSync(data)) {
    fs.mkdirSync(data, { recursive: true });
  }
  if (!fs.existsSync(database)) {
    fs.writeFileSync(database, JSON.stringify([]));
  }
  return database;
}

main();
