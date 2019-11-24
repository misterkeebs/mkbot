const _ = require('lodash');

class BaseCommand {
  constructor(client, msg, content, subcommands=[]) {
    this.client = client;
    this.msg = msg;
    this.content = content;
    this.parts = this.content && this.content.split(' ');
    this.subcommands = subcommands;

    this.serverId = this.msg.guild && this.msg.guild.id;
    this.channelId = this.msg.channel && this.msg.channel.id;
    this.channel = this.msg.channel && this.msg.channel.name;
    this.user = this.msg.author;
  }

  async runSubcommand() {
    const subcommand = this.parts.length > 0 && this.parts[0];
    if (!subcommand) {
      return this.reply(`please specify a subcommand: ${this.subcommands.join(', ')}`)
    }
    const params = this.parts.slice(1);
    return this[subcommand](params);
  }

  getAttrs(...attrs) {
    const res = attrs.reduce((hash, attr, i) => {
      if (!_.get(this.parts, i)) {
        hash.missing.push(attr);
      } else {
        hash.values.push(this.parts[i]);
      }
      return hash;
    }, { missing: [], values: [] });
    if (res.missing.length) {
      const { cmdDef } = this.msg;
      const attrStr = attrs.map(a => `[${a}]`).join(' ');
      this.reply(`missing ${res.missing.join(', ')}. Use \`!${cmdDef.key} ${attrStr}\``);
      return [];
    }
    return res.values;
  }

  reply(text, options) {
    this.msg.reply(text, options);
  }
}

module.exports = BaseCommand;
