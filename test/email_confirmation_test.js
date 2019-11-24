const expect = require('chai').expect;
const DBMigrate = require('db-migrate');

const FakeDiscord = require('./support/fake_discord');

let bot;
describe.only('!email command', () => {
  before(async () => {
    dbmigrate = DBMigrate.getInstance(true, {
      throwUncatched: true,
      env: 'test',
    });
    await dbmigrate.reset();
    await dbmigrate.up();

    bot = new FakeDiscord();
    return bot.init();
  });

  describe('with no arguments', () => {
    it('sends an error message', async () => {
      await bot.sendDM('!email');
      expect(bot.lastReply.msg).to.match(/missing email/);
    });
  });
});
