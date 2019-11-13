const { select, insert, update, doDelete } = require('../db');

class Base {
  constructor(client, data={}) {
    this.client = client;
    Object.keys(data).forEach(k => {
      this[k] = data[k];
    });
  }

  query(sql, data) {
    return this.client.query(sql, data);
  }

  select(options) {
    return select(this.client, options);
  }

  insert(table, options) {
    return insert(this.client, table, options);
  }

  delete(table, where) {
    return doDelete(this.client, table, where);
  }

  update(options) {
    return update(this.client, options);
  }
}

module.exports = Base;
