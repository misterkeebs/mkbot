const createOrm = require('./orm-base');
const classAdditions = {
  getWithCount: async (client) => {
    const sql = `
    SELECT m.maker_id, m.name, count(a.*) AS count
    FROM makers m
    JOIN artisans a ON m.maker_id = a.maker_id
    GROUP BY m.maker_id, m.name
    ORDER BY count DESC
    `;
    return await client.query(sql);
  }
};
module.exports = createOrm('makers', { classAdditions });
