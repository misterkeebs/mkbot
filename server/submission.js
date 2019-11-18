const path = require('path');
const RouterConfig = require('./router-config');

const SubmissionDb = require('../database/submission');

class Submission extends RouterConfig {
  routes() {
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
}

module.exports = Submission;
