require('dotenv').config();

const { Client } = require('pg');
const Discord = require('discord.js');

const Server = require('./database/server');
const handleDM = require('./direct.js');

const TOKEN = process.env.TOKEN;
const bot = new Discord.Client();

const COMMANDS = {
  // artisan search/display
  'pic': { public: true, module: require('./commands/pic') },
  'rand': { public: true, module: require('./commands/random') },
  'catalog': { public: true, module: require('./commands/catalog') },

  // list management
  'list': { public: true, module: require('./commands/user-list') },
  'wishlist': { public: true, module: require('./commands/wishlist') },
  'wl': { public: true, module: require('./commands/wishlist') },

  // submission management
  'review': { userRole: 'reviewer', module: require('./commands/review') },
  'addm': { userRole: 'reviewer', module: require('./commands/add-maker') },
  'fix': { userRole: 'reviewer', module: require('./commands/fix') },
  'app': { userRole: 'reviewer', module: require('./commands/approve') },
  'rej': { userRole: 'reviewer', module: require('./commands/reject') },

  // permissions management
  'channel': { permission: 'MANAGE_CHANNELS', public: true, anyChannel: true, module: require('./commands/channel') },

  // user management
  'role': { role: 'admin', module: require('./commands/role') },
  'email': { module: require('./commands/email') },
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

    // command doesn't allow public execution
    if (!isDM && !cmdDef.public) return;

    // user can't execute this command
    if (!await Server.canExecute(client, cmdDef, msg)) return;

    // console.log('msg', msg);
    console.log('member', msg.member);

    msg.channel.startTyping();
    msg.cmdDef = cmdDef;
    msg.cmdDef.key = cmdKey;
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
