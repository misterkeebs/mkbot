const axios = require('axios');

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
