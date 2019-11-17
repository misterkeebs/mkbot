const Discord = require('discord.js');
const dedent = require('dedent');
const _ = require('lodash');

const db = require('./db');

function sendHelp(msg, options={}) {
  const extra = `${options.error ? `Error: **${options.error}**\n\n` : ``}${options.warn  ? `${options.warn}\n\n` : ``}`;
  const txt = dedent`
      For submissions to be accepted, you need to send it along with a text with the maker, sculpt, colorway and optionally the collection for the keycap.\n
      The format has to be like:
      \`maker: Art Key Universe, sculpt: Medieval King, colorway: Camping\`\n
      For a list of current makers, try the \`!catalog\` command.
      `;
  return msg.reply(extra + txt);
}


module.exports = async function(client, msg) {
  return new Promise(async (resolve, reject) => {
    if (msg.content && msg.content.startsWith('!')) {
      return resolve(false);
    }
    if (msg.attachments) {
      if (_.get(msg, 'author.bot')) return;

      const atts = msg.attachments.array();
      if (atts.length < 1) return resolve(false);

      const { content } = msg;
      const parts = content.split(',');
      if (parts < 1) {
        sendHelp(msg, {
          warn: 'Seems like you sent me a submission. Thank you!',
        });
        resolve(true);
      }

      const input = parts.reduce((hash, p) => {
        const [key, value] = p.split(':');
        hash[key.trim().toLowerCase()] = value.trim();
        return hash
      }, {});

      const keys = Object.keys(input);
      const missing = ['maker', 'sculpt'].filter(k => keys.indexOf(k) === -1);

      if (missing.length > 0) {
        return sendHelp(msg, {
          error: `${missing.join(', ')} field(s) missing.`,
        });
        resolve(true);
      }

      const data = _.pick(input, ['maker', 'collection', 'sculpt', 'colorway']);
      const username = _.get(msg, 'author.username');
      const discrim = _.get(msg, 'author.discriminator');
      data.user = `${username}#${discrim}`;
      data.user_id = _.get(msg, 'author.id');
      data.status = 'submitted';
      data.image = atts[0].url;
      const res = await db.insert(client, 'submissions', data);
      const id = res.submission_id;

      msg.reply(dedent`
        Got it! Thanks for the submission!
        You can check the status of your submission at any time using: \`!review ${id}\`.
      `);
      resolve(true);
    }
  });
};
