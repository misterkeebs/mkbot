const _ = require('lodash');

const BaseCommand = require('./base');
const Server = require('../database/server');

const SUBCOMMANDS = ['allow', 'deny'];

class ChannelCommand extends BaseCommand {
  constructor(client, msg, content) {
    super(client, msg, content, SUBCOMMANDS);
  }

  async run() {
    console.log('running');
    console.log('serverId', this.serverId);
    if (!this.serverId) return;
    this.server = await Server.findOrCreate(this.client, this.serverId);
    return await this.runSubcommand();
  }

  async allow(params) {
    const whitelist = this.server.whitelist || [];
    whitelist.push(this.channel);
    this.server.whitelist = _.uniq(whitelist);
    await this.server.save();

    this.reply(`running mkbot commands is now allowed on this channel!`);
  }

  async deny(params) {
    const whitelist = this.server.whitelist || [];
    const blacklist = this.server.blacklist || [];
    const whitelistPos = whitelist.indexOf(this.channel);

    if (whitelistPos > -1) {
      whitelist.splice(whitelistPos, 1);
    }

    if (whitelist.length < 1) {
      blacklist.push(this.channel);
    }

    this.server.whitelist = _.uniq(whitelist);
    this.server.blacklist = _.uniq(blacklist);
    await this.server.save();

    this.reply(`running mkbot commands is no longer allowed on this channel!`);
  }
}

module.exports = async function(client, msg, content) {
  await new ChannelCommand(client, msg, content).run();
};
