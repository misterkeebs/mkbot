require('dotenv').config();

const { Client } = require('pg');
const Discord = require('discord.js');

const handleDM = require('./direct.js');

const TOKEN = process.env.TOKEN;
const bot = new Discord.Client();

const COMMANDS = {
  'pic': { public: true, module: require('./commands/pic') },
  'list': { public: true, module: require('./commands/user-list') },
  'wishlist': { public: true, module: require('./commands/wishlist') },
  'wl': { public: true, module: require('./commands/wishlist') },
  'catalog': { public: true, module: require('./commands/catalog') },
  'rand': { public: true, module: require('./commands/random') },
  'review': require('./commands/review'),
  'addm': require('./commands/add-maker'),
  'fix': require('./commands/fix'),
  'app': require('./commands/approve'),
  'rej': require('./commands/reject'),
};

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on('message', async msg => {
  const isDM = msg.channel && msg.channel.type === 'dm';
  if (isDM) {
    if (await handleDM(client, msg)) return;
  }

  const { content } = msg;
  if (!content || !content.startsWith('!')) return;

  const cmdKey = Object.keys(COMMANDS).find(c => content.startsWith(`!${c}`));
  if (!cmdKey) return;

  try {
    const params = content.split(' ').slice(1).join(' ');
    const cmdDef = COMMANDS[cmdKey];
    const module = cmdDef instanceof Object ? cmdDef.module : cmdDef;
    if (!cmdDef.public) return;

    console.log('msg', msg.guild);

    msg.channel.startTyping();
    await module(client, msg, params);
  } catch (err) {
    console.error('Error on', cmdKey, err, msg);
  } finally {
    msg.channel.stopTyping();
  }
});

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_USE_SSL !== 'false',
});

client.connect().then(_ => {
  bot.login(TOKEN)
    .catch(err => console.log('err', err));
});
