const _ = require('lodash');

const Artisan = require('./artisan');
const Maker = require('./maker');
const createOrm = require('./orm-base');

const classAdditions = {
  getQueue: async (client, options) => {
    const sql = `
    SELECT
      s.submission_id, s.created_at, s.user, u.name, u.nickname,
      s.image, s.maker, s.sculpt, s.colorway,
      SUBSTRING(s.user_id, '([\\d]{1,9})') as x
    FROM
      submissions s
    LEFT OUTER JOIN users u ON u.user_id = CAST(SUBSTRING(s.user_id, '([\\d]{1,9})') AS integer)
    WHERE
      processed_at IS NULL
    ORDER BY
      s.created_at
    `;
    return client.query(sql).then(res => {
      return res.rows;
    });
  },
};

const instanceAdditions = {
  approve: async function(approver) {
    console.log(' *** XXX this', this);
    const data = _.pick(this, ['collection', 'sculpt', 'colorway', 'image']);
    data.submitted_by = this.user;
    data.submitted_at = this.created_at;
    data.submission_id = this.submission_id;

    const maker = await Maker.findOrCreate(this.client, { name: this.maker });
    data.maker_id = maker.maker_id;

    const artisan = new Artisan(this.client, data);
    await artisan.insert('artisans', data);

    this.processed_at = new Date();
    this.processed_by = approver.user_id;
    this.status = 'approved';
    return this.save();
  },

  reject: async function(approver) {
    this.processed_at = new Date();
    this.processed_by = approver.user_id;
    this.status = 'rejected';
    return this.save();
  }
};

module.exports = createOrm('submissions', { classAdditions, instanceAdditions });
