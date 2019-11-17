const dedent = require('dedent');
const _ = require('lodash');

const { format } = require('./format');
const db = require('../db');
const { findPendingSubmission } = require('../database/utils');

module.exports = async function(client, msg, content) {
  const data = await findPendingSubmission(client, content);
  if (!data) {
    return msg.reply(`Couldn't find a submission with id **${content}**`);
  }

  const sub = await db.update(client, {
    table: 'submissions',
    set: { status: 'rejected', processed_at: new Date() },
    where: 'submission_id = $1',
    data: [content],
  });

  msg.reply(`Submission for ${format(sub)} was rejected.`);
}
