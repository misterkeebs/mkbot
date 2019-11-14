const { Client } = require('pg');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');

dotenv.config();
const client = new Client({ connectionString: process.env.DATABASE_URL });

const app = express();
app.use(cors());
app.use(bodyParser.json());

const ApiServer = require('./server/server');

client.connect().then(_ => {
  new ApiServer(client, app).addRoutes();

  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on port ${port}!`);
  });
});
