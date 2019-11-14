const Base = require('./base');
const { insert, select } = require('../db');

class User extends Base {
  static async findUserRole(client, user_id) {
    const data = await select(client, {
      table: 'users',
      where: ['user_id = $1'],
      data: [user_id],
    });
    if (!data) return;
    return data.role;
  }

  static async find(client, fields) {
    const data = await select(client, {
      table: 'users',
      where: fields,
    });
    if (!data) return;
    return new User(client, data);
  }

  static async create(client, fields) {
    const data = await insert(client, 'users', fields);
    return new User(client, data);
  }

  static async findOrCreate(client, fields) {
    const user = await User.find(client, fields);
    if (user) return user;

    return await User.create(client, fields);
  }
}

module.exports = User;
