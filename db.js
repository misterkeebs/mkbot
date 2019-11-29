const dedent = require('dedent');
const _ = require('lodash');
const { log } = require('./debug.js');

function parseWhere(def) {
  if (!_.isArray(def.where) && _.isObject(def.where)) {
    const nullWheres = _.pickBy(def.where, _.isNull);
    def.where = _.pickBy(def.where, v => !_.isNull(v));

    const whereData = Object.values(def.where);
    const initData = def.data || [];
    const ix = initData.length;
    const where = Object.keys(def.where).map((f, i) => `${f} = $${i+ix+1}`);
    const data = _.flatten([initData, whereData]);

    Object.keys(nullWheres).forEach(k => where.push(`${k} IS NULL`));
    return { where, data };
  }
  const { data, where } = def;
  return { data, where };
}

class DB {
  insert(db, table, data) {
    const fields = Object.keys(data);
    const values = fields.map(f => data[f]);
    const indexes = fields.map((_, i) => `$${i+1}`);
    const sql = dedent`
    INSERT INTO ${table}
    (${fields.map(f => `"${f}"`).join(', ')})
    VALUES
    (${indexes}) RETURNING *`;
    log('sql', sql, values);
    return db.query(sql, values).then(res => {
      log('res', res.rows);
      return res.rows[0];
    });
  }

  select(db, options) {
    return this.selectAll(db, options).then(rows => {
      if (rows.length < 2) {
        return rows[0];
      }
      return rows;
    });
  }

  processWhereArray(where) {
    return where.map(w => {
      if (_.isObject(w)) {
        const keys = Object.keys(w);
        const clause = keys.map(k => `${k} = ${w[k]}`);
        return `(${clause.join(' AND ')})`;
      }
      return w;
    });
  }

  parseJoins(joins) {
    if (!_.isArray(joins)) return (joins ? ` JOIN ${joins}` : null);

    return joins.map(j => {
      if (_.isObject(j)) {
        const { type, on } = j;
        return ` ${type||''} JOIN ${on}`;
      }
      return ` JOIN ${j}`;
    }).join(' ');
  }

  selectAll(db, options) {
    const { fields, table, joins, order, page, perPage } = options;
    const { where, data } = parseWhere(options);

    const fieldList = _.isArray(fields)
      ? fields.join(', ') : (fields ? fields : '*');
    const whereClause = _.isArray(where)
      ? ` WHERE ${this.processWhereArray(where).join(' AND ')} `
      : (where ? ` WHERE ${where}` : null);
    const orderClause = _.isArray(order)
      ? ` ORDER BY ${order.join(', ')}`
      : (order ? ` ORDER BY ${order}` : null);
    const joinsClause = this.parseJoins(joins);

    const sqlArr = [];
    if (options.perPage) {
      sqlArr.push(`SELECT ${fieldList}, count(*) OVER() AS full_count FROM ${table}`);
    } else {
      sqlArr.push(`SELECT ${fieldList} FROM ${table}`);
    }
    joinsClause && sqlArr.push(joinsClause);
    whereClause && sqlArr.push(whereClause);
    orderClause && sqlArr.push(orderClause);
    if (options.perPage) {
      const limit = perPage;
      const offset = (page-1) * perPage;
      sqlArr.push(` LIMIT ${limit} OFFSET ${offset}`);
    }

    const sql = _.flatten(sqlArr).join('');
    log('sql', sql, data);
    return db.query(sql, data).then(res => {
      log('res', res);
      return res.rows;
    });
  }

  update(db, options) {
    // fields, where, whereValues
    const { table, set, where, data } = options;
    const start = data.length + 1;
    const fieldSets = Object.keys(set).map((k, i) => `"${k}" = $${i+start}`).join(', ');
    data.push(Object.values(set));
    const sql = `
    UPDATE ${table} SET ${fieldSets} WHERE ${where}
    RETURNING *
    `;

    log('sql', sql, _.flatten(data));
    return db.query(sql, _.flatten(data)).then(res => {
      return res.rows[0];
    });
  }

  doDelete(db, table, where) {
    const whereClause = Object.keys(where).map((k, i) => `${k} = $${i+1}`).join(' AND ');
    const values = Object.values(where);
    const sql = dedent`
    DELETE FROM ${table}
    WHERE ${whereClause}`;
    log('sql', sql, values);
    return db.query(sql, values);
  }
}

module.exports = new DB();
