const Base = require('./base');
const db = require('../db');
const ListImage = require('../commands/list-image');

class List extends Base {
  constructor(client, type, data={}) {
    super(client, data);
    this.type = type;
  }

  static async findOrCreate(client, type, user_id) {
    const list = await List.findByUser(client, type, user_id);
    if (list) return list;

    return await List.create(client, type, user_id);
  }

  static async findByUser(client, type, user_id) {
    const data = await db.select(client, {
      table: 'lists',
      where: ['user_id = $1', 'type = $2'],
      data: [user_id, type]
    });
    if (!data) return;
    return new List(client, type, data);
  }

  static async create(client, type, user_id) {
    const data = await db.insert(client, 'lists', { user_id, type });
    return new List(client, type, data);
  }

  async add(artisan) {
    await this.insert('list_artisans', {
      list_id: this.list_id,
      artisan_id: artisan.artisan_id,
    });
    return artisan;
  }

  async remove(artisan_id) {
    return await this.delete('list_artisans', {
      list_id: this.list_id,
      artisan_id,
    });
  }

  async getArtisans() {
    const sql = `
    SELECT
      a.*, m.name AS maker
    FROM list_artisans w
    JOIN artisans a ON w.artisan_id = a.artisan_id
    JOIN makers m ON m.maker_id = a.maker_id
    WHERE w.list_id=$1;
    `;
    return this.query(sql, [this.list_id]).then(res => {
      return res.rows;
    });
  }

  async toImage() {
    return await new ListImage(this).render();
  }
}

module.exports = List;
