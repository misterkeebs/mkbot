const Base = require('./base');

const { insert, select } = require('../db');

class Server extends Base {
  static async find(client, discord_guild_id) {
    const data = await select(client, {
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
    const data = await insert(client, 'servers', { server_id });
    return new Server(client, data);
  }
}

module.exports = Server;
