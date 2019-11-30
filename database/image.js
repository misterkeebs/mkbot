const createOrm = require('./orm-base');
const dedent = require('dedent');

const Email = require('./email');
const User = require('./user');
const Artisan = require('./artisan');

const classAdditions = {
  getQueue: async (client, options) => {
    const sql = `
      SELECT
        i.image_id, i.created_at, i.image, i.submitted_by,
        m.name as maker, a.sculpt, a.colorway
      FROM images i
      JOIN artisans a ON i.artisan_id = a.artisan_id
      JOIN makers m ON a.maker_id = m.maker_id
      WHERE i.processed_at IS NULL
      ORDER BY i.created_at`;
    return client.query(sql).then(res => {
      return res.rows;
    });
  },
};

const instanceAdditions = {
  approve: async function(approver, data) {
    this.processed_at = new Date();
    this.approved_by = approver.user_id;
    this.status = 'approved';
    const res = await this.save();

    this.sendApprovalEmail();
    return res;
  },

  reject: async function(approver) {
    this.processed_at = new Date();
    this.approved_by = approver.user_id;
    this.status = 'rejected';
    return this.save();
  },

  sendApprovalEmail: async function() {
    const user = await User.find(this.client, { user_id: this.user_id });
    const artisan = await Artisan.find(this.client, { artisan_id: this.artisan_id });
    Email.send(user,
      `Your image submission for ${artisan.sculpt} ${artisan.colorway} was approved!`,
      dedent`
        Hey there,

        One of our reviewers just approved your image submission for the
        ${artisan.sculpt} ${artisan.colorway} keycap from ${artisan.maker}.

        You can see it here:
        ${process.env.BASE_URL}/artisans/${artisan.artisan_id}-${encodeURI(`${artisan.maker}-${artisan.sculpt}-${artisan.colorway}`)}

        I wanted to thank you personally for helping we grow this community driven database!

        In an upcoming release we will add a badge to your account with the number
        of contributions you did :)

        Best,

        MrKeebs
    `);
  }
}

module.exports = createOrm('images', { classAdditions, instanceAdditions });
