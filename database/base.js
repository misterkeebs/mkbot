const _ = require('lodash');

const db = require('../db');

class Base {
  constructor(client, data={}) {
    this.client = client;
    Object.keys(data).forEach(k => {
      this[k] = data[k];
    });
  }

  toJSON() {
    return _.chain(this)
      .omit('client')
      .omitBy(_.isFunction)
      .value();
  }

  query(sql, data) {
    return this.client.query(sql, data);
  }

  select(options) {
    return db.select(this.client, options);
  }

  insert(table, options) {
    return db.insert(this.client, table, options);
  }

  delete(table, where) {
    return db.doDelete(this.client, table, where);
  }

  update(options) {
    return db.update(this.client, options);
  }

  async save(pk) {
    const set = this.toJSON();
    const where = `${pk} = $1`;
    return await this.update({ table, set, where, data: [this[pk]] });
  }
}

module.exports = Base;
