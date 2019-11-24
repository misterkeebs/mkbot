const expect = require('chai').expect;
const DBMigrate = require('db-migrate');
const { Client } = require('pg');

const FakeDiscord = require('./support/fake_discord');
client = new Client({
  connectionString: process.env.TEST_DATABASE,
  ssl: process.env.TEST_DATABASE_USE_SSL !== 'false',
});

let bot;
describe('!email command', () => {
  before(async () => {
    global.emails = [];
    dbmigrate = DBMigrate.getInstance(true, {
      throwUncatched: true,
      env: 'test',
    });
    await dbmigrate.reset();
    await dbmigrate.up();
    await client.connect();
  });

  beforeEach(() => {
    bot = new FakeDiscord();
    return bot.init();
  });

  describe('with no arguments', () => {
    it('sends an error message', async () => {
      await client.query(`TRUNCATE TABLE email_confirmations`);
      await bot.sendDM('!email');
      expect(bot.lastReply).to.match(/missing email/);
    });
  });

  describe('resending', () => {
    describe('when a confirmation was already sent', () => {
      beforeEach(async () => {
        global.emails = [];
        await client.query(`TRUNCATE TABLE email_confirmations`);
        await client.query(`
          INSERT INTO email_confirmations
          (token, discord_user_id, email)
          VALUES ('TOKEN', 'AUTHOR_ID', 'felipe.coury@gmail.com')`);
        await bot.sendDM('!email resend');
      });

      it('sends a new email', () => {
        expect(global.emails.length).to.eql(1);
        expect(global.emails[0].to).to.eql('felipe.coury@gmail.com');
        expect(global.emails[0].text).to.include('nickname#0909');
      });
    });
  });

  describe('with a new email address', () => {
    beforeEach(async () => {
      global.emails = [];
      await client.query(`TRUNCATE TABLE email_confirmations`);
      await bot.sendDM('!email felipe.coury@gmail.com');
    });

    it('replies with a message', async () => {
      expect(bot.lastReply).to.match(/Confirmation email sent! Please check your email for the confirmation link./);
    });

    it('sends email', () => {
      expect(global.emails.length).to.eql(1);
      expect(global.emails[0].to).to.eql('felipe.coury@gmail.com');
      expect(global.emails[0].text).to.include('nickname#0909');
    });

    it('creates new email confirmation entry', async () => {
      const res = await client.query(`SELECT * FROM email_confirmations`);
      const { rows } = res;

      expect(rows.length).to.eql(1);
      expect(rows[0].discord_user_id).to.eql('AUTHOR_ID');
      expect(rows[0].email).to.eql('felipe.coury@gmail.com');
    });
  });

  describe('with an existing email address', () => {
    beforeEach(async () => {
      await client.query(`TRUNCATE TABLE email_confirmations`);
      await client.query(`
        INSERT INTO email_confirmations
        (token, email) VALUES ('TOKEN', 'felipe.coury@gmail.com')`);
      await bot.sendDM('!email felipe.coury@gmail.com');
    });

    it('sets the discord id', async () => {
      const res = await client.query(`
        SELECT * FROM email_confirmations WHERE email='felipe.coury@gmail.com'`);
      const { rows } = res;
      expect(rows[0].discord_user_id).to.eql('AUTHOR_ID');
    });

    it('reports the email already existed', () => {
      expect(bot.lastReply).to.match(/You already have a confirmation pending/);
    });
  });
});
