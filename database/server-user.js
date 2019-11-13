const Base = require('./base');
const { insert, select } = require('../db');

class User extends Base {
  static async findUserRole(client, user_id) {
    const data = await select(client, {
      table: 'server_users',
      where: ['server_id IS NULL', 'user_id = $1'],
      data: [user_id],
    });
    if (!data) return;
    return data.role;
  }

  static async find(client, server_id, user_id) {
    const data = await select(client, {
      table: 'server_users',
      where: ['server_id = $1', 'user_id = $2'],
      data: [server_id, user_id],
    });
    if (!data) return;
    return new User(client, data);
  }
}

module.exports = User;
