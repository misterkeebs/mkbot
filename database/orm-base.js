const _ = require('lodash');
const inflex = require('pluralize');

const Base = require('./base');
const { insert, select } = require('../db');

module.exports = (table, additions={}) => {
  const pk = `${inflex.singular(table)}_id`;
  console.log('pk', pk);
  const orm = class Orm extends Base {
    static async find(client, where) {
      const data = await select(client, { table, where });
      if (!data) return;
      return new orm(client, data);
    };

    static async create(client, data) {
      const insertedData = await insert(client, table, data);
      return new orm(client, insertedData);
    };

    static async findOrCreate(client, query) {
      const entity = await orm.find(data);
      if (entity) return entity;

      return await orm.create(data);
    };

    async save() {
      const set = this.toJSON();
      console.log('set', set);
      const where = `${pk} = $1`;
      console.log('where', where);
      return await this.update({ table, set, where, data: [this[pk]] });
    }
  }

  Object.keys(additions).forEach(key => {
    orm.prototype[key] = additions[key];
  });

  return orm;
}
