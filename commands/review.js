const dedent = require('dedent');

const { card } = require('./format');
const { findMaker } = require('../database/utils');

module.exports = async function(client, msg, content) {
  const where = content
    ? `AND submission_id = $1`
    : '';
  const data = content
    ? [parseInt(content, 10)]
    : [];
  const sql = `
  SELECT
    submission_id, created_at, "user" AS submitted_by, "user", user_id, maker,
    collection, sculpt, colorway, image, created_at as timestamp
  FROM
    submissions
  WHERE
    processed_at IS NULL
    ${where}
  ORDER BY
    created_at DESC
  LIMIT 1
  `;
  client.query(sql, data).then(res => {
    const data = res.rows[0];

    if (!data) return msg.reply('No items left to review');

    const text = `Please check the entry below submitted by **${data.user}**`;
    return msg.reply(text, card(data)).then(async _ => {
      const maker = await findMaker(client, data.maker);
      if (!maker) {
        return await msg.reply(dedent`
        ERROR: Maker **${data.maker}** was not found.

        - to add it, use \`!addm ${data.maker}\`
        - to fix the maker name, use \`!fix maker ${data.submission_id} [maker name]\`
        - to reject this submission, use \`!rej ${data.submission_id}\`

        After taking action, you can check this entry again with \`!review ${data.submission_id}\`
        `);
      }

      return msg.reply(dedent`
        To approve use \`!app ${data.submission_id}\`
        To reprove use \`!rej ${data.submission_id}\`
      `);
    });
  });
}
