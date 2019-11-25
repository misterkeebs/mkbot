const _ = require('lodash');
const inflex = require('pluralize');

const Base = require('./base');
const db = require('../db');

module.exports = (table, options={}) => {
  const { classAdditions={}, instanceAdditions={} } = options;

  const pk = `${inflex.singular(table)}_id`;
  const orm = class Orm extends Base {
    static async getAll(client, options={}) {
      const { order, page, perPage } = options;
      return await db.selectAll(client, {
        table, order, page, perPage
      });
    }

    static async find(client, where) {
      const data = await db.select(client, { table, where });
      if (!data) return;
      return new orm(client, data);
    };

    static async create(client, data) {
      const insertedData = await db.insert(client, table, data);
      const res = new orm(client, insertedData);
      if (this.afterCreate) {
        await this.afterCreate(client, data);
      }
      return res;
    };

    static async findOrCreate(client, query) {
      const entity = await orm.find(client, query);
      if (entity) return entity;

      return await orm.create(client, query);
    };

    async save() {
      const set = this.toJSON();
      const where = `${pk} = $1`;
      return await this.update({ table, set, where, data: [this[pk]] });
    }

    async reload() {
      return orm.find(client, { user_id: this.user_id });
    }
  }

  Object.keys(classAdditions).forEach(key => {
    orm[key] = classAdditions[key];
  });

  Object.keys(instanceAdditions).forEach(key => {
    orm.prototype[key] = instanceAdditions[key];
  });

  return orm;
}
