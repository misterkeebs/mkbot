const Discord = require('discord.js');
const dedent = require('dedent');
const _ = require('lodash');

const Base = require('./base');
const { Artisan, List, User } = require('../database/index');
const { card, format, formatMatches } = require('./format');

const SUBCOMMANDS = {
  add: 'add',
  remove: 'remove',
};

class ListCommand extends Base {
  constructor(type='list', client, msg, content) {
    super(client, msg, content);
    this.isDM = msg.channel && msg.channel.type === 'dm';
    this.type = type;
  }

  async run() {
    this.parts = this.content && this.content.split(' ');
    if (!this.parts || this.parts.length < 1) {
      return this.view(this.client, this.msg, this.content);
    }
    const subcommand = SUBCOMMANDS[this.parts.shift()];
    if (!this.isDM) {
      return this.reply(`\`!${this.type}\` subcommands cannot be used in public`);
    };
    if (!subcommand) return this.error(`Error: invalid ${this.type} command`);
    return this[subcommand]();
  }

  async getList() {
    const { author } = this.msg;
    const user = await User.findOrCreate(this.client, { discord_user_id: author.id });
    const list = await List.findByUser(this.client, this.type, user.user_id);
    if (!list) {
      await this.reply(
        `You don't currently have a ${this.type}. To create one use \`!${this.type} add [artisan partial name]\`.`);
    }
    return list;
  }

  async view() {
    const list = await this.getList();
    console.log('list', list);
    if (!list) return;

    const artisans = await list.getArtisans();
    const res = [
      'Your list has the following artisans:',
      '',
      artisans.map(a => `- ${format(a)}`),
    ];

    const attachment = new Discord.Attachment(await list.toImage(), 'list.png');
    this.reply(_.flattenDeep(res).join('\n'), attachment);
  }

  async findArtisan(terms) {
    const artisans = await Artisan.search(this.client, terms);
    if (!artisans) {
      this.reply(`No artisans matched **${terms}**.`);
    }
    return artisans;
  }

  async add() {
    const terms = this.parts.join(' ');
    const { author } = this.msg;
    const list = await List.findOrCreate(this.client, this.type, author.id);
    console.log('list', list);

    const artisans = await this.findArtisan(terms);
    console.log('artisans', artisans);
    if (!artisans) return;

    const total = artisans.length;
    if (total > 15) {
      artisans.splice(15, total-15);
    }

    if (artisans.length && artisans.length > 1) {
      const res = formatMatches(artisans, terms);
      if (total > 15) {
        res.push(`... and ${total-15} more not shown`);
      }
      res.push([
        '',
        `You can use \`!${this.type} add [search]/[num]\` to them`
      ]);
      return this.reply(_.flattenDeep(res).join('\n'));
    }

    try {
      const res = await list.add(artisans);
      return this.reply(`${format(artisans)} added to your list!`, card(artisans));
    } catch (err) {
      console.log('err', err);
      if (err.message.indexOf('unique constraint')) {
        return this.reply(`${format(artisans)} was already on your list!`);
      } else {
        return this.reply(`There was an error processing you command.`);
      }
    }
  }

  async remove() {
    const terms = this.parts.join(' ');
    const list = await getList();
    if (!list) return;

    const artisans = await findArtisan(terms);
    if (!artisans) return;

    if (artisans.length && artisans.length > 1) {
      const res = formatMatches(artisans, terms);
      res.push([
        '',
        `You can use \`!${this.type} remove [search]/[num]\` to them`
      ]);
      return this.reply(_.flattenDeep(res).join('\n'));
    }

    const res = await list.remove(artisans.artisan_id);
    if (res.rowCount < 1) {
      return this.reply(`${format(artisans)} was not part of you list.`);
    }
    return this.reply(`${format(artisans)} removed from your list!`, card(artisans));
  }

  error(error) {
    const validCommands = Object.keys(SUBCOMMANDS).join(', ');
    return this.reply(`${error}. Valid commands are: ${validCommands}.`);
  }
}

module.exports = ListCommand;
