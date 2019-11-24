const _ = require('lodash');

const RouterConfig = require('./router-config');
const Maker = require('../database/maker');
const Artisan = require('../database/artisan');

class MakerRoutes extends RouterConfig {
  routes() {
    this.get('/makers', this.getMakers.bind(this));
    this.get('/makers/:maker_id/sculpts', this.getMakerSculpts.bind(this));
    this.get('/makers/:maker_id/artisans', this.getMakerArtisans.bind(this));
  }

  async getMakers(req, res, next) {
    const order = req.query.order;
    const data = await Maker.getWithCount(this.client, { order });
    res.json(data.rows);
  }

  async getMakerSculpts(req, res, next) {
    const { maker_id } = req.params;
    const data = await Maker.getSculpts(this.client, maker_id);
    res.json(data.rows);
  }

  async getMakerArtisans(req, res, next) {
    const { page=1, perPage=30 } = req.query;
    const { maker_id } = req.params;
    const { sculpt } = req.query;

    const where = ['m.maker_id = $1'];
    const data = [maker_id];

    if (sculpt) {
      where.push('a.sculpt = $2');
      data.push(sculpt);
    }

    const result =
      await Artisan.getAll(this.client, { page, perPage, where, data }) || [];
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

module.exports = MakerRoutes;
