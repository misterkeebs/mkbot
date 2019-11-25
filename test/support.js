require('dotenv').config();
const { Client } = require('pg');
const DBMigrate = require('db-migrate');

const Debug = require('../debug');
global.logLevel = Debug.DEBUG;

async function connect() {
  dbmigrate = DBMigrate.getInstance(true, {
    throwUncatched: true,
    env: 'test',
  });
  await dbmigrate.reset();
  await dbmigrate.up();

  const client = new Client({
    connectionString: process.env.TEST_DATABASE_URL,
    ssl: process.env.TEST_DATABASE_USE_SSL !== 'false',
  });

  await client.connect();
  return client;
}


module.exports = {
  connect,
};
