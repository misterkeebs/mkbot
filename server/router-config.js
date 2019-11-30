const axios = require('axios');
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const mime = require('mime-types');
const User = require('../database/user');
const jwtAuthz = require('express-jwt-authz');

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

  async addUser(req, res) {
    try {
      if (req.user) {
        this.userEmail = req.user['http://a.mrkeebs.com/email'];
        this.user = await User.findOrCreate(this.client, { email: this.userEmail });
      }
      return true;
    } catch (error) {
      console.error('Erro fetching user profile:\n', error);
      res.status(500).json({ message: error.message, error });
      return false;
    }
  }

  methodWithAuth(method, path, param1, param2) {
    const { fn, role, checkRole } = this.resolve(param1, param2);

    const endPoint = `/api${path}`;
    if (role) {
      this.app[method](endPoint, this.jwtCheck, checkRole, fn);
    } else {
      this.app[method](endPoint, this.jwtCheck, fn);
    }
  }

  async getAuth(path, param1, param2) {
    return this.methodWithAuth('get', path, param1, param2);
  }

  async postAuth(path, param1, param2) {
    return this.methodWithAuth('post', path, param1, param2);
  }

  async putAuth(path, fn) {
    this.app.put(`/api${path}`, this.jwtCheck, async (req, res, next) => {
      if (!await this.addUser(req, res)) return;
      return fn(req, res, next);
    });
  }

  async deleteAuth(path, fn) {
    this.app.delete(`/api${path}`, this.jwtCheck, async (req, res, next) => {
      if (!await this.addUser(req, res)) return;
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
    this.app.put(`/api${path}`, withUpload, this.jwtCheck, async (req, res, next) => {
      if (!await this.addUser(req, res)) return;
      return fn(req, res, next);
    });
  }

  resolve(param1, param2) {
    const fn = param2 ? param2 : param1;
    const role = param2 ? param1 : null;
    let checkRole = null;

    const method = async (req, res, next) => {
      if (!await this.addUser(req, res)) return;
      return fn(req, res, next);
    };

    if (role) {
      checkRole = (req, res, next) => {
        const { user } = req;
        const roles = user && user['http://a.mrkeebs.com/roles'] || [];
        if (!user || !roles.includes(role)) {
          return res.status(403).json({ error: 'Not authorized' });
        }
        next();
      };
    }

    return { role, fn: method, checkRole };
  }
}

module.exports = RouterConfig;
