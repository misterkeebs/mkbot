const Base = require('./base');

class Artisan extends Base {
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
}

module.exports = Artisan;