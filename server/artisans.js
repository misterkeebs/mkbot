const _ = require('lodash');

const RouterConfig = require('./router-config');
const Artisan = require('../database/artisan');

class ArtisanRoutes extends RouterConfig {
  routes() {
    this.get('/artisans', this.getArtisans.bind(this));
    this.get('/artisans/:artisan_id', this.getArtisan.bind(this));
    this.get('/artisans/similar', this.getSimilarArtisans.bind(this));
  }

  async getSimilarArtisans(req, res, next) {
    const { term, threshold } = req.query;
    try {
      const artisans = await Artisan.getSimilar(this.client, term, threshold);
      res.json(artisans);
    } catch (error) {
      console.error('Error getting similar artisans', error);
      res.status(500).json({ message: error.message, error });
    }
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

  async getArtisan(req, res, next) {
    const { artisan_id } = req.params;
    const artisan = await Artisan.find(this.client, { 'a.artisan_id': artisan_id });
    if (!artisan) {
      res.status(404).json({ error: 'Not found' });
    }
    res.json(artisan);
  }
}

module.exports = ArtisanRoutes;
