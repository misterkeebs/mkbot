const dedent = require('dedent');
const _ = require('lodash');

function parseWhere(def) {
  console.log(' *** def.where', def.where, _.isObject(def.where));
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

module.exports = {
  insert: (db, table, data) => {
    const fields = Object.keys(data);
    const values = fields.map(f => data[f]);
    const indexes = fields.map((_, i) => `$${i+1}`);
    const sql = dedent`
    INSERT INTO ${table}
    (${fields.map(f => `"${f}"`).join(', ')})
    VALUES
    (${indexes}) RETURNING *`;
    console.log('sql', sql, values);
    return db.query(sql, values).then(res => {
      console.log('res', res.rows);
      return res.rows[0];
    });
  },

  select: (db, options) => {
    const { fields, table, joins, order, page, perPage } = options;
    const { where, data } = parseWhere(options);

    const fieldList = _.isArray(fields)
      ? fields.join(', ') : (fields ? fields : '*');
    const whereClause = _.isArray(where)
      ? ` WHERE ${where.join(' AND ')} `
      : (where ? ` WHERE ${where}` : null);
    const orderClause = _.isArray(order)
      ? ` ORDER BY ${order.join(', ')}`
      : (order ? ` ORDER BY ${order}` : null);
    const joinsClause = _.isArray(joins)
      ? ` JOIN ${joins.join(', ')}`
      : (joins ? ` JOIN ${joins}` : null);

    const sqlArr = [];
    if (options.perPage) {
      sqlArr.push(`SELECT ${fieldList}, count(*) OVER() AS full_count FROM ${table}`);
    } else {
      sqlArr.push(`SELECT ${fieldList} FROM ${table}`);
    }
    whereClause && sqlArr.push(whereClause);
    joinsClause && sqlArr.push(joinsClause);
    orderClause && sqlArr.push(orderClause);
    if (options.perPage) {
      const limit = perPage;
      const offset = (page-1) * perPage;
      sqlArr.push(` LIMIT ${limit} OFFSET ${offset}`);
    }

    const sql = _.flatten(sqlArr).join('');
    console.log('sql', sql, data);
    return db.query(sql, data).then(res => {
      console.log('res', res.rows);
      if (res.rows.length < 2) {
        return res.rows[0];
      }
      return res.rows;
    });
  },

  update: (db, options) => {
    // fields, where, whereValues
    const { table, set, where, data } = options;
    const start = data.length + 1;
    const fieldSets = Object.keys(set).map((k, i) => `${k} = $${i+start}`).join(', ');
    data.push(Object.values(set));
    const sql = `
    UPDATE ${table} SET ${fieldSets} WHERE ${where}
    RETURNING *
    `;

    console.log('sql', sql, _.flatten(data));
    return db.query(sql, _.flatten(data)).then(res => {
      return res.rows[0];
    });
  },

  doDelete: (db, table, where) => {
    const whereClause = Object.keys(where).map((k, i) => `${k} = $${i+1}`).join(' AND ');
    const values = Object.values(where);
    const sql = dedent`
    DELETE FROM ${table}
    WHERE ${whereClause}`;
    console.log('sql', sql, values);
    return db.query(sql, values);
  }
}
