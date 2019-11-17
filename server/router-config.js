const axios = require('axios');

const User = require('../database/user');

class RouterConfig {
  constructor(server) {
    this.jwtCheck = server.jwtCheck;
    this.app = server.app;
    this.client = server.client;
  }

  get(path, fn) {
    this.app.get(`/api${path}`, fn);
  }

  getAuth(path, fn) {
    this.app.get(`/api${path}`, this.jwtCheck, async (req, res, next) => {
      req.userProfile = await this.fetchUserProfile(req);
      return fn(req, res, next);
    });
  }

  async deleteAuth(path, fn) {
    this.app.delete(`/api${path}`, this.jwtCheck, async (req, res, next) => {
      this.userProfile = await this.fetchUserProfile(req);
      this.user = await User.findOrCreate(this.client, { email: this.userProfile.email });

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
