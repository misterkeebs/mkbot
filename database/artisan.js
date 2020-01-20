const _ = require('lodash');

const Base = require('./base');
const db = require('../db');
const table = 'artisans';

class Artisan extends Base {
  static async find(client, where, order) {
    const fields = 'a.artisan_id, a.maker_id, m.name AS maker, a.sculpt, a.colorway, a.image, a.submitted_by, a.submitted_at';
    const table = 'artisans a';
    const joins = ['makers m ON m.maker_id = a.maker_id'];
    const data = await db.select(client, {
      table, where, fields, joins });
    if (!data) return;
    return new Artisan(client, data);
  }

  static async getAll(client, options) {
    const {
      order='maker, sculpt, colorway',
      page=1, perPage=30,
      data=[],
      includeImages=false,
    } = options;
    let where = options.where;
    const imageFields = includeImages ? ', i.image_id, i.image AS extra_image, i.submitted_by as image_submitted_by, i.created_at as image_created_at' : '';
    const fields = `a.artisan_id, a.maker_id, m.name AS maker, a.sculpt, a.colorway, a.image, a.submitted_by, a.submitted_at${imageFields}`;
    const table = 'artisans a';
    let joins = ['makers m ON m.maker_id = a.maker_id'];
    if (options.terms) {
      where = _.isArray(where) ? where : (where ? [where] : []);
      where.push(`
        CONCAT(a.collection, ' ', a.sculpt, ' ', a.colorway) ILIKE $${where.length+1}
        OR CONCAT(a.colorway, ' ', a.colorway) ILIKE $${where.length+1}
      `);
      data.push(`%${options.terms}%`);
    }
    if (includeImages) {
      where = _.isArray(where) ? where : (where ? [where] : []);
      console.log('joins b', joins);
      joins = joins.map(on => { return { on } });
      console.log('joins', joins);
      joins.push({
        type: 'LEFT OUTER',
        on: `images i ON a.artisan_id = i.artisan_id AND i.processed_at IS NOT NULL AND i.status = 'approved'`,
      });
      console.log('joins', joins);
    }
    console.log(' *** where', where);
    const results = await db.selectAll(client, {
      fields, table, order, joins, page, perPage, where, data
    });
    return results;
  }

  static async getSimilar(client, term, _threshold='0.4') {
    const sql = `
    SELECT
      a.artisan_id, a.collection, m.name AS maker,
      a.sculpt, a.colorway, a.image, a.submitted_by,
      created_at as timestamp,
      SIMILARITY(a.sculpt || ' ' || a.colorway, $1) AS similarity
    FROM artisans a
    JOIN makers m ON m.maker_id = a.maker_id
    WHERE SIMILARITY(a.sculpt || ' ' || a.colorway, $1) IS NOT NULL
    AND SIMILARITY(a.sculpt || ' ' || a.colorway, $1) > $2
    ORDER BY similarity DESC
    LIMIT 5
    `;
    const threshold = parseFloat(_threshold);
    return client.query(sql, [term, threshold]).then(res => {
      return res.rows;
    });
  }

  static async search(client, _term) {
    const [rest, numStr] = _term.split('/');
    const num = numStr && numStr.length
      ? parseInt(numStr, 10)-1
      : null;
    const term = rest;
    const sql = `
    SELECT
      a.artisan_id, a.collection, m.name AS maker,
      a.sculpt, a.colorway, a.image, a.submitted_by,
      created_at as timestamp
    FROM artisans a
    JOIN makers m ON m.maker_id = a.maker_id
    WHERE CONCAT(a.collection, ' ', a.sculpt, ' ', a.colorway) ILIKE $1
    `;
    return client.query(sql, [`%${term}%`]).then(res => {
      const { rows } = res;
      const text = [];
      if (num > rows.length-1) {
        return null;
      }
      const match = rows[num || 0];

      if (rows.length < 1) {
        return null;
      }

      if (rows.length > 1 && !numStr) {
        return rows.map(r => new Artisan(client, r));
      }

      return new Artisan(client, match);
    });
  }

  get makerLink() {
    const param = encodeURI(`${this.maker_id}-${this.maker}`);
    return `/catalogs/${param}`;
  }

  toJSON() {
    const res = super.toJSON();
    res.makerLink = this.makerLink;
    return res;
  }
}

module.exports = Artisan;
