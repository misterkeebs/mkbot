const Base = require('./base');
const db = require('../db');
const User = require('./user');

class Server extends Base {
  static async find(client, discord_guild_id) {
    const data = await db.select(client, {
      table: 'servers',
      where: 'server_id = $1',
      data: [discord_guild_id],
    });
    if (!data) return;
    return new Server(client, data);
  }

  static async findOrCreate(client, server_id) {
    const server = await Server.find(client, server_id);
    if (server) return server;

    return await Server.create(client, server_id);
  }

  static async create(client, server_id) {
    const data = await db.insert(client, 'servers', { server_id });
    return new Server(client, data);
  }

  static async canExecute(client, cmd, msg) {
    const userData = msg.author;
    const guildData = msg.guild;
    const channelData = msg.channel;

    console.log(' *** userData', userData);
    console.log(' *** channelData', channelData);

    if (cmd.userRole) {
      const userRole = await User.findUserRole(client, userData.id);
      if (userRole === 'admin') {
        return true;
      }
      console.log('Command needs', cmd.userRole, 'user is', userRole);
      return cmd.userRole === userRole;
    }

    if (guildData && channelData) {
      if (userData && cmd.permission) {
        if (!msg.channel.permissionsFor(msg.member).has(cmd.permission)) {
          console.log('User', msg.author.username, 'does not have', cmd.permission, 'on', `#${msg.channel.name} channel`);
          return false;
        }
      }

      if (cmd.anyChannel) {
        return cmd.anyChannel;
      }

      const server = await Server.find(client, guildData.id);
      if (server && !(await server.canExecute(cmd, msg))) {
        return false;
      }
    }

    return true;
  }

  canExecute(cmd, msg) {
    const userData = msg.author;
    const guildData = msg.guild;
    const channelData = msg.channel;

    if (this.whitelist && this.whitelist.length) {
      return this.whitelist.indexOf(channelData.name) > -1;
    }

    if (this.blacklist && this.blacklist.length) {
      return this.blacklist.indexOf(channelData.name) === -1;
    }

    return true;
  }

  async save() {
    const { whitelist, blacklist } = this;
    return await this.update({
      table: 'servers',
      set: { whitelist, blacklist },
      where: 'server_id = $1',
      data: [this.server_id],
    });
  }
}

module.exports = Server;
