const Discord = require('discord.js');

const Base = require('./base');
const db = require('../db');

class User extends Base {
  static async findUserRole(client, user_id) {
    const data = await db.select(client, {
      table: 'users',
      where: ['user_id = $1'],
      data: [user_id],
    });
    if (!data) return;
    return data.role;
  }

  static async find(client, fields) {
    const data = await db.select(client, {
      table: 'users',
      where: fields,
    });
    if (!data) return;
    return new User(client, data);
  }

  static async create(client, fields) {
    const data = await db.insert(client, 'users', fields);
    return new User(client, data);
  }

  static async findOrCreate(client, fields) {
    const user = await User.find(client, fields);
    if (user) return user;

    return await User.create(client, fields);
  }

  getDiscordInfo() {
    const bot = new Discord.Client();
    bot.login(process.env.TOKEN)
  }

  async save() {
    return await super.save('users', 'user_id');
  }

  async sendPrivateMessage(text) {
    const { discord_user_id } = this;
    return new Promise(async (resolve, reject) => {
      const discord = new Discord.Client();
      discord.on('ready', async () => {
        const user = await discord.fetchUser(discord_user_id);
        console.log('user', user);
        const msgRes = await user.sendMessage(text);
        console.log('msgRes', msgRes);
        return Promise.resolve(msgRes);
      });
      return await discord.login(process.env.TOKEN);
    });
  }
}

module.exports = User;
