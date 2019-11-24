const Server = require('./database/server');
const handleDM = require('./direct.js');

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

class Bot {
  constructor(client) {
    this.client = client;
  }

  async execute(msg) {
    const isDM = msg.channel && msg.channel.type === 'dm';
    if (isDM) {
      if (await handleDM(this.client, msg)) return;
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
      if (!await Server.canExecute(this.client, cmdDef, msg)) return;

      msg.channel.startTyping();
      msg.cmdDef = cmdDef;
      msg.cmdDef.key = cmdKey;
      await module(this.client, msg, params);
    } catch (err) {
      console.error('Error on', cmdKey, err, msg);
      msg.channel.stopTyping();
      msg.reply(`We're sorry, but there was an error processing your last message:\n\`${err}\`\n`);
    } finally {
      msg.channel.stopTyping();
    }
  }
}

module.exports = Bot;
