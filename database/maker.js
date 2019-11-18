const createOrm = require('./orm-base');
const classAdditions = {
  getWithCount: async (client, options) => {
    const order = options.order || 'count DESC';
    const sql = `
    SELECT m.maker_id, m.name, count(a.*) AS count
    FROM makers m
    JOIN artisans a ON m.maker_id = a.maker_id
    GROUP BY m.maker_id, m.name
    ORDER BY ${order}
    `;
    return await client.query(sql);
  },

  getSculpts: async (client, maker_id) => {
    const sql = `
    SELECT sculpt, count(*) AS count
    FROM artisans
    WHERE maker_id = $1
    GROUP BY sculpt
    ORDER BY sculpt
    `;
    return await client.query(sql, [maker_id]);
  }
};
module.exports = createOrm('makers', { classAdditions });
