const RouterConfig = require('./router-config');
const List = require('../database/list');

class ListRoutes extends RouterConfig {
  routes() {
    this.deleteAuth('/lists/:type/:artisan_id', this.removeArtisan.bind(this));
  }

  async removeArtisan(req, res, next) {
    const { type, artisan_id } = req.params;
    const list = await List.findByUser(this.client, type, this.user.discord_user_id);
    const response = await list.remove(artisan_id);
    var start = new Date().getTime();
    res.json({ deleted: response && response.rowCount > 0 });
  }
}

module.exports = ListRoutes;
