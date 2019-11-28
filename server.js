const path = require('path');
const { Client } = require('pg');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');

dotenv.config();
const client = new Client({ connectionString: process.env.DATABASE_URL });

const app = express();
app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.json());

const ApiServer = require('./server/api-server');
const ConfirmationRoute = require('./server/confirmation-route');
const DiscordRoutes = require('./server/discord');

client.connect().then(_ => {
  new DiscordRoutes(client, app).addRoutes();
  new ConfirmationRoute(client, app).addRoutes();
  new ApiServer(client, app).addRoutes();

  app.use(express.static(path.join(__dirname, 'client', 'build')));
  app.use((_, res) => {
    res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
  });

  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on port ${port}!`);
  });
});
