const _ = require('lodash');

const RouterConfig = require('./router-config');
const Artisan = require('../database/artisan');

class ArtisanRoutes extends RouterConfig {
  routes() {
    this.get('/artisans', this.getArtisans.bind(this));
    this.get('/artisans/similar', this.getSimilarArtisans.bind(this));
    this.get('/artisans/:artisan_id', this.getArtisan.bind(this));
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
    const { page=1, perPage=30, order, q } = req.query;
    const result =
      await Artisan.getAll(this.client, { page, perPage, order, terms: q }) || [];
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
    const rows = await Artisan.getAll(this.client, {
      where: { 'a.artisan_id': artisan_id },
      includeImages: true,
      perPage: null,
    });

    console.log(' *** rows', rows, rows[0]);
    if (!rows[0]) {
      return res.status(404).json({ error: 'Not found' });
    }

    const artData = _.pick(rows[0], [
      'artisan_id', 'maker_id', 'maker', 'sculpt', 'colorway',
      'image', 'submitted_by', 'submitted_at',
    ]);
    const artisan = new Artisan(this.client, artData);
    artisan.images = rows.filter(r => r.image_id).map(r => {
      const image = {
        image_id: r.image_id,
        image: r.extra_image,
        submitted_by: r.image_submitted_by,
        created_at: r.image_created_at,
      }
      image.image = r.extra_image;
      return image;
    });

    res.json(artisan);
  }
}

module.exports = ArtisanRoutes;
