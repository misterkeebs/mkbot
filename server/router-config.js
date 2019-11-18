const axios = require('axios');
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const mime = require('mime-types');
const User = require('../database/user');

aws.config.update({ region: 'us-west-2' });

const bucket = process.env.S3_UPLOAD_BUCKET;

class RouterConfig {
  constructor(server) {
    this.jwtCheck = server.jwtCheck;
    this.app = server.app;
    this.client = server.client;
  }

  get(path, fn) {
    this.app.get(`/api${path}`, fn);
  }

  async addUser(req) {
    this.userProfile = await this.fetchUserProfile(req);
    this.user = await User.findOrCreate(this.client, { email: this.userProfile.email });
  }

  getAuth(path, fn) {
    this.app.get(`/api${path}`, this.jwtCheck, async (req, res, next) => {
      req.userProfile = await this.fetchUserProfile(req);
      return fn(req, res, next);
    });
  }

  async putAuth(path, fn) {
    this.app.put(`/api${path}`, this.jwtCheck, async (req, res, next) => {
      await this.addUser(req);
      return fn(req, res, next);
    });
  }

  async postAuth(path, fn) {
    this.app.post(`/api${path}`, this.jwtCheck, async (req, res, next) => {
      await this.addUser(req);
      return fn(req, res, next);
    });
  }

  async deleteAuth(path, fn) {
    this.app.delete(`/api${path}`, this.jwtCheck, async (req, res, next) => {
      await this.addUser(req);
      return fn(req, res, next);
    });
  }

  async putUploadAuth(path, metadata, fn) {
    const upload = multer({
      storage: multerS3({
        s3: new aws.S3(),
        bucket,
        acl: 'public-read',
        contentType: function(req, file, cb) {
          cb(null, file.mimetype);
        },
        key: function(req, file, cb) {
          cb(null, metadata.fileName(req, file));
        },
      }),
    });

    this.uploadPrefix = `https://${bucket}.s3.amazonaws.com/`;
    const withUpload = upload.fields([{ name: metadata.field, maxCount: 1 }]);
    this.app.put(`/api${path}`, withUpload, async (req, res, next) => {
      await this.addUser(req);
      return fn(req, res, next);
    });
  }

  async fetchUserProfile(req) {
    const url = `${process.env.AUTH0_URL}/userinfo`;
    const res = await axios({
      url,
      headers: { authorization: req.headers.authorization },
    });
    return res.data;
  }
}

module.exports = RouterConfig;
