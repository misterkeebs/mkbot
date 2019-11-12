const { card } = require('./format');

module.exports = function(client, msg, content) {
  let where = '';
  const data = [];

  if (content && content.length) {
    where = 'WHERE m.name ILIKE $1';
    data.push(`%${content}%`);
  }
  const sql = `
  SELECT
    a.artisan_id, a.collection, m.name AS maker, a.sculpt, a.colorway, a.image
  FROM artisans a
  JOIN makers m ON m.maker_id = a.maker_id
  ${where}
  ORDER BY random()
  LIMIT 1
  `;

  client.query(sql, data).then(res => {
    const data = res.rows[0];
    return msg.reply('', card(data));
  });
}
