const dedent = require('dedent');
const _ = require('lodash');

const { format, card } = require('./format');
const db = require('../db');
const { findMaker } = require('../database/utils');

module.exports = async function(client, msg, content) {
  const data = await db.select(client, {
    table: 'submissions',
    where: 'submission_id = $1',
    data: [content]
  });

  if (!data) {
    return msg.reply(`Couldn't find a submission with id **${content}**`);
  }

  const maker = await findMaker(client, data.maker);
  if (!maker) {
    return await msg.reply(dedent`
    ERROR: Maker **${data.maker}** was not found.

    - to add it, use \`!addm ${data.maker}\`
    - to fix the maker name, use \`!fix maker ${data.submission_id} [maker name]\`
    - to reject this submission, use \`!dec ${data.submission_id}\`

    After taking action, you can approve this entry with \`!app ${data.submission_id}\`
    `);
  }

  data.maker_id = maker.maker_id;

  const insertData = _.pick(data, ['maker_id', 'collection', 'sculpt', 'colorway', 'image']);
  insertData.submitted_by = data.user;
  insertData.submitted_at = data.created_at;

  const artisan = await db.insert(client, 'artisans', insertData);
  artisan.maker = maker.name;

  const sub = await db.update(client, {
    table: 'submissions',
    set: { status: 'approved', processed_at: new Date() },
    where: 'submission_id = $1',
    data: [content],
  });
  msg.reply(`Submission for ${format(sub)} was approved.`, card(artisan));
}
