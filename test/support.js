require('dotenv').config();

const { Client } = require('pg');

async function connect() {
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
