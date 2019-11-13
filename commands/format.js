const Discord = require('discord.js');

const isnum = (val) => /^\d+$/.test(val);

function formatMatches(artisans, term) {
  return [
    `${artisans.length} matches found:`,
    '',
    artisans.map((r, i) => `${i+1}. ${format(r)} - \`${term}/${i+1}\``),
  ];
}

function formatName(data) {
  const colorway = data.colorway ? ` ${data.colorway}` : '';
  return `${data.sculpt}${colorway}`;
}

function format(data) {
  const collection = data.collection && data.collection.length
    ? ` from ${data.collection}`
    : '';
  return `${data.maker} - **${formatName(data)}**${collection}`;
}

function card(data) {
  const embed = new Discord.RichEmbed()
    .setAuthor(`${data.sculpt} ${data.colorway}`)
    .setTitle(data.maker)
    .setImage(data.image)
    .setTimestamp(data.submitted_at)
    .setFooter(`Submitted by ${data.submitted_by}`);

  if (data.collection) {
    embed.setDescription(`${data.collection} collection`);
  }

  if (data.timestamp) {
    embed.setTimestamp(data.timestamp);
  }

  return embed;
};

module.exports = { format, formatMatches, formatName, card };
