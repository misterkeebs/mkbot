const dedent = require('dedent');

const { insert } = require('../db');
const { findMaker } = require('../database/utils');

module.exports = async function(client, msg, content) {
  const maker = await findMaker(client, content);
  if (maker) {
    return msg.reply(`Maker **${content}** already exists.`);
  }
  await insert(client, 'makers', { name: content });
  return msg.reply(`Make **${content}** was successfully added.`);
}
