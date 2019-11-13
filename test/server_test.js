const expect = require('chai').expect;
const { connect, query } = require('./support');

const Server = require('../database/server');

const addServer = async (client, whitelist, blacklist) => {
  const sql = `
    INSERT INTO servers (server_id, whitelist, blacklist)
    VALUES ($1, $2, $3);`;
  await client.query(sql, ['SERVER_ID', whitelist, blacklist]);
};

describe('Server DB', () => {
  let client;

  before(async () => {
    console.log('before');
    client = await connect();
  });

  beforeEach(async () => {
    await client.query('TRUNCATE TABLE servers');
  });

  describe('.find', () => {
    let server;

    describe('when server exists', () => {
      beforeEach(async function() {
        await addServer(client, [], []);
        server = await Server.find(client, 'SERVER_ID');
      });

      it('returns the server', async () => {
        expect(server.whitelist).to.eql([]);
      });
    });

    describe(`when server doesn't exist`, () => {
      beforeEach(async function() {
        await addServer(client, [], []);
        server = await Server.find(client, 'OTHER_SERVER');
      });

      it('returns nothing', async () => {
        expect(server).to.be.undefined;
      });
    });
  });

  describe('.findOrCreate', () => {
    describe(`when server doesn't exist`, () => {
      beforeEach(async function() {
        server = await Server.findOrCreate(client, 'OTHER_SERVER');
      });

      it('creates a new server', () => {
        expect(server).to.not.be.undefined;
        expect(server.server_id).to.eql('OTHER_SERVER');
      });
    });

    describe('when server exists', () => {
      beforeEach(async function() {
        await addServer(client, ['channel1'], []);
        server = await Server.findOrCreate(client, 'SERVER_ID');
      });

      it('returns the existing server', () => {
        expect(server).to.not.be.undefined;
        expect(server.server_id).to.eql('SERVER_ID');
        expect(server.whitelist).to.eql(['channel1']);
      });
    });
  });
});
