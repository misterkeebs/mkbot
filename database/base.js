const _ = require('lodash');
const inflex = require('pluralize');

const db = require('../db');

class Base {
  constructor(client, data={}, options={}) {
    this.client = client;
    this.readOnlyFields = options.readOnlyFields || [];
    Object.keys(data).forEach(k => {
      this[k] = data[k];
    });
  }

  toJSON() {
    const res =  _.chain(this)
        .omitBy(_.isFunction)
        .merge(_.pick(this, this.readOnlyFields))
        .omit(['client', 'prototype', 'length', 'readOnlyFields'])
        .value();
    console.log(' *** JSON this', res);
    return res;
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

  async save(table, pk = `${inflex.singular(table)}_id`) {
    console.log(' *** this.public', this.public);
    const set = _.omit(this.toJSON(), this.readOnlyFields);
    console.log(' *** set', set);
    const where = `${pk} = $1`;
    return await this.update({ table, set, where, data: [this[pk]] });
  }
}

module.exports = Base;
