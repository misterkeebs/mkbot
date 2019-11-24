const _ = require('lodash');

const RouterConfig = require('./router-config');
const Artisan = require('../database/artisan');

class ArtisanRoutes extends RouterConfig {
  routes() {
    this.get('/artisans', this.getArtisans.bind(this));
  }

  async getArtisans(req, res, next) {
    const { page=1, perPage=30, q } = req.query;
    const result =
      await Artisan.getAll(this.client, { page, perPage, terms: q }) || [];
    const count = result[0] ? result[0].full_count : 0;
    const artisans = result.map(a => _.omit(a, 'full_count'));
    res
      .header('X-Pagination-Page', page)
      .header('X-Pagination-PerPage', perPage)
      .header('X-Pagination-Total', count)
      .header('X-Pagination-TotalPages', Math.ceil(count / perPage))
      .json(artisans);
  }
}

module.exports = ArtisanRoutes;
