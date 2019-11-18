const dedent = require('dedent');

const User = require('../database/user');
const List = require('../database/list');

class DiscordRoutes {
  constructor(client, app) {
    this.client = client;
    this.app = app;
  }

  addRoutes() {
    this.app.use(async (req, res, next) => {
      const agent = req.get('User-Agent');
      const path = req.path;
      if (agent && path && path.startsWith('/u/') && agent.indexOf('Discord') > -1) {
        if (await this.handleDiscord(req, res, next)) {
          return;
        }
      }
      next();
    });
  }

  async handleDiscord(req, res, next) {
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
    const description = `Artisan ${listType} for ${nickname} containing: ${artisans.map(a => `${a.maker} ${a.sculpt} ${a.colorway}`)}`;

    res.send(dedent`
    <!DOCTYPE html>
    <html lang="en" class="h-100">
      <head>
        <meta charset="utf-8" />
        <meta property="og:title" content="${nickname}'s Artisans ${listType}  - MrKeebs Artisans" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="${url}" />
        <meta property="og:image" content="${image}" />
        <meta property="og:description" content="Site description" />
      </head>
      <body>
      </body>
    </html>
    `);
    return true;
  }
}

module.exports = DiscordRoutes;
