const { Client } = require('pg');
const Bot = require('../../bot');

class FakeDiscord {
  constructor() {
    this.client = new Client({
      connectionString: process.env.TEST_DATABASE,
      ssl: process.env.TEST_DATABASE_USE_SSL !== 'false',
    });
    this.bot = new Bot(this.client);
    this.author = {
      id: 'AUTHOR_ID',
      username: `nickname`,
      discriminator: `0909`,
    };
  }

  get lastReply() {
    return this.lastMessage && this.lastMessage.msg;
  }

  async init() {
    this.messages = [];
    return await this.client.connect();
  }

  async sendDM(str) {
    return await this.send('dm', str);
  }

  async send(channelType, str) {
    const bot = new Bot(this.client);
    const channel = {
      type: channelType,
      startTyping: _ => _,
      stopTyping: _ => _,
    };
    const member = {

    };
    const author = this.author;
    const msg = {
      author,
      channel,
      member,
      content: str,
      reply: (msg, options) => {
        const message = { msg, options };
        this.messages.push(message)
        this.lastMessage = message;
      },
    };
    await bot.execute(msg);
  }
}

module.exports = FakeDiscord;
