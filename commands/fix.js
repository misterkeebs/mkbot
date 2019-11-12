const dedent = require('dedent');

const { select, update } = require('../db');

const FIELDS = ['collection', 'sculpt', 'colorway', 'name', 'maker'];

module.exports = async function(client, msg, content) {
  const parts = content.split(' ');
  if (parts.length < 3) {
    return msg.reply('Invalid syntax. Use `!fix [field] [id] [new-value]`');
  }

  const field = parts.shift();
  const id = parseInt(parts.shift(), 10);
  const value = parts.join(' ');
  const options = {
    fields: 'count(*) as total',
    table: 'submissions',
    where: ['processed_at IS NULL', 'submission_id = $1'],
    data: [id],
  };

  const res = await select(client, options);

  if (res.total < 1) {
    return msg.reply(`Submission ${id} not found.`);
  }

  if (FIELDS.indexOf(field) < 0) {
    return msg.reply(
      `Field **${field}** doesn't exist. The fields you can update are: ${FIELDS.join(', ')}.`
    );
  }

  const resUp = await update(client, {
    table: 'submissions',
    set: { [field]: value },
    where: 'submission_id = $1',
    data: [id]
  });

  return msg.reply(`Submission was updated. To review it now run \`!review ${id}\``)
}
