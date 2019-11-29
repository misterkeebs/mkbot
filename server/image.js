const path = require('path');
const uuidv3 = require('uuid/v3');

const RouterConfig = require('./router-config');
const Image = require('../database/image');

class ImageRoutes extends RouterConfig {
  routes() {
     this.putUploadAuth('/images', {
      field: 'image',
      fileName: (req, file) => {
        const { maker, sculpt, colorway } = req.body;
        const ext = path.extname(file.originalname);
        const token = uuidv3(`${maker}-${sculpt}-${new Date()}`, process.env.APP_KEY);
        const fileName = `${maker}-${sculpt}-${colorway}-${token}${ext}`;
        this.uploadUrl = `${this.uploadPrefix}${encodeURI(fileName)}`;
        return fileName;
      },
    }, this.addImage.bind(this));

    this.postAuth('/images/:image_id/approve', 'reviewer',
      this.approve.bind(this));
    this.postAuth('/images/:image_id/reject', 'reviewer',
      this.reject.bind(this));
  }

  async addImage(req, res, next) {
    const { artisan_id, description, author } = req.body;
    const { user_id } = this.user;
    const image = this.uploadUrl;
    const submitted_by = author;
    const submission = await Image.create(this.client, {
      user_id, submitted_by, artisan_id, image, description
    });
    res.json(submission);
  }

  async approve(req, res, next) {
    const { image_id } = req.params;
    const sub = await Image.find(this.client, { image_id })
    if (!sub) {
      return res.status(404).json({ message: 'Not found' });
    }
    await sub.approve(this.user, this.userProfile);
    res.json(sub);
  }

  async reject(req, res, next) {
    const { image_id } = req.params;
    const sub = await Image.find(this.client, { image_id })
    if (!sub) {
      return res.status(404).json({ message: 'Not found' });
    }
    await sub.reject(this.user, this.userProfile);
    res.json(sub);
  }
}

module.exports = ImageRoutes;
