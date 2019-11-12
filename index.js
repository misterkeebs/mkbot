require('dotenv').config();

const { Client } = require('pg');
const Discord = require('discord.js');

const handleDM = require('./direct.js');

const TOKEN = process.env.TOKEN;
const bot = new Discord.Client();

const COMMANDS = {
  'pic': require('./commands/pic'),
  'catalog': require('./commands/catalog'),
  'rand': require('./commands/random'),
  'review': require('./commands/review'),
  'list': require('./commands/user-list'),
  'wishlist': require('./commands/wishlist'),
  'wl': require('./commands/wishlist'),
  'addm': require('./commands/add-maker'),
  'fix': require('./commands/fix'),
  'app': require('./commands/approve'),
  'rej': require('./commands/reject'),
};

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on('message', async msg => {
  if (msg.channel && msg.channel.type === 'dm') {
    if (await handleDM(client, msg)) return;
  }

  const { content } = msg;
  if (!content || !content.startsWith('!')) return;

  const cmdKey = Object.keys(COMMANDS).find(c => content.startsWith(`!${c}`));
  if (!cmdKey) return;

  try {
    msg.channel.startTyping();
    const params = content.split(' ').slice(1).join(' ');
    await COMMANDS[cmdKey](client, msg, params);
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
