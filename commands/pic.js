const Discord = require('discord.js');
const _ = require('lodash');

const { format, card } = require('./format');

module.exports = function(client, msg, content) {
  const [rest, numStr] = content.split('/');
  const num = numStr && numStr.length
    ? parseInt(numStr, 10)-1
    : null;
  const term = rest;
  const sql = `
  SELECT
    a.artisan_id, a.collection, m.name AS maker,
    a.sculpt, a.colorway, a.image, a.submitted_by,
    created_at as timestamp
  FROM artisans a
  JOIN makers m ON m.maker_id = a.maker_id
  WHERE CONCAT(a.collection, ' ', a.sculpt, ' ', a.colorway) ILIKE $1
  `;
  client.query(sql, [`%${term}%`]).then(res => {
    const { rows } = res;
    const text = [];
    const match = rows[num || 0];
    let embed = null;

    if (rows.length < 1) {
      return msg.reply('No matches');
    } else if (rows.length > 5 && !numStr) {
      text.push([
        'Too many results, please narrow down the search'
      ]);
    } else if (rows.length > 1 && !numStr) {
      text.push([
        `${rows.length} matches found:`,
        '',
        rows.map((r, i) => `${i+1}. ${format(r)} - \`${term}/${i+1}\``),
        '',
        'Please use `!pic` with a narrower term'
      ]);
    } else {
      text.push('');
      embed = card(match);
    }

    return msg.reply(_.flattenDeep(text).join('\n'), embed);
  });
}
