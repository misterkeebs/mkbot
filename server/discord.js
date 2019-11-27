const dedent = require('dedent');

const User = require('../database/user');
const List = require('../database/list');
const Artisan = require('../database/artisan');

class DiscordRoutes {
  constructor(client, app) {
    this.client = client;
    this.app = app;
  }

  addRoutes() {
    this.app.use(async (req, res, next) => {
      const agent = req.get('User-Agent');
      const isDiscord = agent && agent.indexOf('Discord') > -1;
      const path = req.path;
      if (!isDiscord) return next();

      if (path.startsWith('/u/')) {
        if (await this.handleUserLinks(req, res, next)) {
          return;
        }
      }

      const matches = path.match('^/artisans/(.*)');
      if (matches) {
        if (await this.handleArtisanLink(matches[1], req, res, next)) {
          return;
        }
      }

      return next();
    });
  }

  async handleArtisanLink(name, req, res, next) {
    const artisan_id = name.split('-')[0];
    const artisan = await Artisan.find(this.client, { artisan_id });

    if (!artisan) return false;

    const url = `${process.env.BASE_URL}${req.path}`;
    const image = artisan.image;
    const description = `Page for the ${artisan.sculpt} ${artisan.colorway} artisan, by ${artisan.maker}.`;
    const content = `${artisan.maker} - ${artisan.sculpt} ${artisan.colorway} - MrKeebs Artisans`;

    res.send(dedent`
    <!DOCTYPE html>
    <html lang="en" class="h-100">
      <head>
        <meta charset="utf-8" />
        <meta property="og:title" content="${content}" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="${url}" />
        <meta property="og:image" content="${image}" />
        <meta property="og:description" content="${description}" />
      </head>
      <body>
      </body>
    </html>
    `);
    return true;
  }

  async handleUserLinks(req, res, next) {
    // /u/:id-:slug/:type
    const [_1, _2, slug, type] = req.path.split('/');
    const [user_id, nickname] = slug.split('-');
    console.log('type, user_id', type, user_id);
    const list = await List.findByUser(this.client, type, user_id);
    if (!list || !list.public) {
      return res.status(404).json({ message: 'List not found' });
    }
    const artisans = await list.getArtisans();

    const url = `${process.env.BASE_URL}${req.path}`;
    const image = artisans.length && artisans[0].image;
    const listType = type.charAt(0).toUpperCase() + type.substring(1);
    const description = `Artisan ${listType} for ${nickname} containing: ${artisans.map(a => `${a.sculpt} ${a.colorway}`).join(', ')}`;
    const content = `${nickname}'s Artisans ${listType} - MrKeebs Artisans`

    res.send(dedent`
    <!DOCTYPE html>
    <html lang="en" class="h-100">
      <head>
        <meta charset="utf-8" />
        <meta property="og:title" content="${content}" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="${url}" />
        <meta property="og:image" content="${image}" />
        <meta property="og:description" content="${description}" />
      </head>
      <body>
      </body>
    </html>
    `);
    return true;
  }
}

module.exports = DiscordRoutes;
