const dedent = require('dedent');
const _ = require('lodash');

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
    const { fields, table, where, data } = options;

    const fieldList = _.isArray(fields)
      ? fields.join(', ') : (fields ? fields : '*');
    const whereClause = _.isArray(where)
      ? ` WHERE ${where.join(' AND ')} `
      : (where ? ` WHERE ${where}` : null);

    const sql = `
    SELECT ${fieldList} FROM ${table}${whereClause}
    `;

    console.log('sql', sql, data);
    return db.query(sql, data).then(res => {
      console.log('res', res.rows);
      return res.rows[0];
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

    console.log('sql', sql, _.flattenDeep(data));
    return db.query(sql, _.flattenDeep(data)).then(res => {
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
