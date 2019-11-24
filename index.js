require('dotenv').config();

const { Client } = require('pg');
const Discord = require('discord.js');

const Bot = require('./bot');
const Server = require('./database/server');
const handleDM = require('./direct.js');

const TOKEN = process.env.TOKEN;
const bot = new Discord.Client();

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on('message', async msg => {
  const handler = new Bot(client);
  await handler.execute(msg);
});

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_USE_SSL !== 'false',
});

client.connect().then(_ => {
  bot.login(TOKEN)
    .catch(err => console.log('err', err));
});
