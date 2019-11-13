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
  }

  async runSubcommand() {
    const subcommand = this.parts.length > 0 && this.parts[0];
    if (!subcommand) {
      return this.reply(`please specify a subcommand: ${this.subcommands.join(', ')}`)
    }
    const params = this.parts.slice(1);
    return this[subcommand](params);
  }

  reply(text, options) {
    console.log('text', text);
    console.log('options', options);
    this.msg.reply(text, options);
  }
}

module.exports = BaseCommand;
