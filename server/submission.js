const path = require('path');
const RouterConfig = require('./router-config');
const _ = require('lodash');

const SubmissionDb = require('../database/submission');

class Submission extends RouterConfig {
  routes() {
    this.getAuth('/submissions', 'reviewer',
      this.getSubmissions.bind(this));
    this.postAuth('/submissions/:submission_id', 'reviewer',
      this.updateSubmission.bind(this))
    this.postAuth('/submissions/:submission_id/approve', 'reviewer',
      this.approve.bind(this));
    this.postAuth('/submissions/:submission_id/reject', 'reviewer',
      this.reject.bind(this));

    this.putUploadAuth('/submissions', {
      field: 'image',
      fileName: (req, file) => {
        const { maker, sculpt, colorway } = req.body;
        const ext = path.extname(file.originalname);
        const fileName = `${maker}-${sculpt}-${colorway}${ext}`;
        this.uploadUrl = `${this.uploadPrefix}${encodeURI(fileName)}`;
        return fileName;
      },
    }, this.addSubmission.bind(this));
  }

  async getSubmissions(req, res, next) {
    const submissions = await SubmissionDb.getQueue(this.client);
    res.json(submissions);
  }

  async addSubmission(req, res, next) {
    const { maker, sculpt, colorway } = req.body;
    const image = this.uploadUrl;
    const { user_id } = this.user;
    const user = this.userProfile.nickname;
    const submission = await SubmissionDb.create(this.client, {
      user_id, user, maker, sculpt, colorway, image
    });
    res.json(submission);
  }

  async updateSubmission(req, res, next) {
    const { submission_id } = req.params;
    console.log(' *** req.body', req.body);
    const submission = await SubmissionDb.find(this.client, { submission_id });
    if (!submission) return res.status(404).json({error: 'Not found'});
    const { maker, sculpt, colorway } = req.body;
    const data = _.pickBy({ maker, sculpt, colorway }, v => !!v);
    Object.keys(data).forEach(k => submission[k] = data[k]);
    const saveRes = await submission.save();
    console.log('saveRes', saveRes);
    res.json(submission);
  }

  async approve(req, res, next) {
    const { submission_id } = req.params;
    const sub = await SubmissionDb.find(this.client, { submission_id })
    if (!sub) {
      return res.status(404).json({ message: 'Not found' });
    }
    await sub.approve(this.user);
    res.json(sub);
  }

  async reject(req, res, next) {
    const { submission_id } = req.params;
    const sub = await SubmissionDb.find(this.client, { submission_id })
    if (!sub) {
      return res.status(404).json({ message: 'Not found' });
    }
    await sub.reject(this.user);
    res.json(sub);
  }
}

module.exports = Submission;
