const _ = require('lodash');
const dedent = require('dedent');

const Email = require('./email');
const Artisan = require('./artisan');
const Maker = require('./maker');
const User = require('./user');
const createOrm = require('./orm-base');

const classAdditions = {
  getQueue: async (client, options) => {
    const sql = `
  SELECT
      s.submission_id, s.created_at, s.user, u.name, u.nickname,
      s.image, s.maker, s.sculpt, s.colorway,
      s.author, s.anonymous,
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

  afterCreate: async function(client, data) {
    if (data.anonymous && data.anonymous !== 'false') return;

    const user = await User.find(client, { user_id: data.user_id });
    if (!user) return;

    user.nickname = data.author;
    return await user.save();
  },
};

const instanceAdditions = {
  approve: async function(approver) {
    const data = _.pick(this, ['collection', 'sculpt', 'colorway', 'image']);
    data.submitted_by = this.anonymous ? 'Anonymous' : this.author;
    data.submitted_at = this.created_at;
    data.submission_id = this.submission_id;

    const maker = await Maker.findOrCreate(this.client, { name: this.maker });
    data.maker_id = maker.maker_id;

    const artisan = new Artisan(this.client, data);
    const newArtisan = await artisan.insert('artisans', data);

    this.processed_at = new Date();
    this.processed_by = approver.user_id;
    this.status = 'approved';
    const res = await this.save();

    await this.sendApprovalEmail(approver, newArtisan);
    return res;
  },

  reject: async function(approver) {
    this.processed_at = new Date();
    this.processed_by = approver.user_id;
    this.status = 'rejected';
    return this.save();
  },

  sendApprovalEmail: async function(user, artisan) {
    Email.send(user,
     `Your submission for ${this.sculpt} ${this.colorway} was approved!`,
      dedent`
        Hey there,

        One of our reviewers just approved your submission for the
        ${this.sculpt} ${this.colorway} keycap from ${this.maker || this.newMaker}.

        You can see it here:
        ${process.env.BASE_URL}/artisans/${artisan.artisan_id}-${encodeURI(`${this.maker || this.newMaker}-${this.sculpt}-${this.colorway}`)}

        I wanted to thank you personally for helping we grow this community driven database!

        In an upcoming release we will add a badge to your account with the number
        of contributions you did :)

        Best,

        MrKeebs
    `);
  }
};

module.exports = createOrm('submissions', { classAdditions, instanceAdditions });
