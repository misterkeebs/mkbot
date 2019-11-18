const RouterConfig = require('./router-config');
const List = require('../database/list');

class ListRoutes extends RouterConfig {
  routes() {
    this.putAuth('/lists/:type/:artisan_id', this.addArtisan.bind(this));
    this.deleteAuth('/lists/:type/:artisan_id', this.removeArtisan.bind(this));
  }

  async removeArtisan(req, res, next) {
    const { type, artisan_id } = req.params;
    const list = await List.findByUser(this.client, type, this.user.user_id);
    const response = await list.remove(artisan_id);
    res.json({ deleted: response && response.rowCount > 0 });
  }

  async addArtisan(req, res, next) {
    const { type, artisan_id } = req.params;
    const list = await List.findOrCreate(this.client, type, this.user.user_id);
    const response = await list.add({ artisan_id });
    console.log(' *** response', response);
    res.json({ added: response && response.rowCount > 0 });
  }
}

module.exports = ListRoutes;
