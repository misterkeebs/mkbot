const _ = require('lodash');

const db = require('../db');

module.exports = {
  findMaker: (client, term) => {
    const sql = `
    SELECT * FROM makers WHERE name ILIKE $1
    `;
    return client.query(sql, [`%${term}%`]).then(res => {
      return res.rows[0];
    });
  },

  findPendingSubmission: async (client, id) => {
    return await db.select(client, {
      table: 'submissions',
      where: ['submission_id = $1', 'processed_at IS null'],
      data: [id]
    });
  }
}
