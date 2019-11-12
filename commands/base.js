class BaseCommand {
  constructor(client, msg, content) {
    this.client = client;
    this.msg = msg;
    this.content = content;
  }

  reply(text, options) {
    console.log('text', text);
    console.log('options', options);
    this.msg.reply(text, options);
  }
}

module.exports = BaseCommand;
