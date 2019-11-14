const _ = require('lodash');

const RouterConfig = require('./router-config');
const User = require('../database/user');

class UserRoutes extends RouterConfig {
  routes() {
    this.getAuth('/user', this.getUser.bind(this));
  }

  async getUser(req, res, next) {
    const { userProfile } = req;
    const user = await User.findOrCreate(this.client, { email: userProfile.email });
    res.json(user);
  }
}

module.exports = UserRoutes;
