const _ = require('lodash');

const RouterConfig = require('./router-config');
const Maker = require('../database/maker');
const Artisan = require('../database/artisan');

class MakerRoutes extends RouterConfig {
  routes() {
    this.get('/makers', this.getMakers.bind(this));
    this.get('/makers/:maker_id/artisans', this.getMakerArtisans.bind(this));
  }

  async getMakers(req, res, next) {
    const data = await Maker.getWithCount(this.client);
    res.json(data.rows);
  }

  async getMakerArtisans(req, res, next) {
    const { page=1, perPage=30 } = req.query;
    const { maker_id } = req.params;
    const result =
      await Artisan.getAll(this.client, {
        page, perPage,
        where: 'm.maker_id = $1',
        data: [maker_id],
      }) || [];
    const count = result[0] ? result[0].full_count : 0;
    console.log(' *** result', result);
    const artisans = result.map(a => _.omit(a, 'full_count'));
    res
      .header('X-Pagination-Page', page)
      .header('X-Pagination-PerPage', perPage)
      .header('X-Pagination-Total', count)
      .header('X-Pagination-TotalPages', Math.ceil(count / perPage))
      .json(artisans);
  }
}

module.exports = MakerRoutes;
