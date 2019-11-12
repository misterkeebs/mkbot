const _ = require('lodash');

module.exports = function(client, msg, content) {
  const sql = `
  SELECT
    m.name, COUNT(a.*) AS total
  FROM makers m
  JOIN artisans a ON m.maker_id = a.maker_id
  GROUP BY m.name
  ORDER BY total DESC
  `;
  client.query(sql).then(res => {
    const total = res.rows.reduce((acc, r) => acc + parseInt(r.total, 10), 0);
    const text = [`we have a total of **${total}** entries on our database with the following makers:`];
    text.push('');
    text.push(
      res.rows.map(r => `- **${r.name}** (${r.total} entries)`)
    );
    return msg.reply(_.flattenDeep(text).join('\n'));
  });
}
