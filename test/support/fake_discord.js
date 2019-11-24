const { Client } = require('pg');
const Bot = require('../../bot');

class FakeDiscord {
  constructor() {
    this.client = new Client({
      connectionString: process.env.TEST_DATABASE,
      ssl: process.env.TEST_DATABASE_USE_SSL !== 'false',
    });
    this.bot = new Bot(this.client);
  }

  async init() {
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
    const msg = {
      channel,
      member,
      content: str,
      reply: (msg, options) => {
        this.lastReply = { msg, options };
      },
    };
    await bot.execute(msg);
  }
}

module.exports = FakeDiscord;
