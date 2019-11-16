const _ = require('lodash');

const RouterConfig = require('./router-config');
const User = require('../database/user');
const List = require('../database/list');

class UserRoutes extends RouterConfig {
  routes() {
    this.getAuth('/user', this.getUser.bind(this));
    this.getAuth('/user/artisans', this.getUserArtisans.bind(this));
  }

  async getUser(req, res, next) {
    const { userProfile } = req;
    const user = await User.findOrCreate(this.client, { email: userProfile.email });
    res.json(user);
  }

  async getUserArtisans(req, res, next) {
    const { userProfile } = req;
    const user = await User.findOrCreate(this.client, { email: userProfile.email });
    const list = await List.findByUser(this.client, 'list', user.discord_user_id);
    const artisans = await list.getArtisans();
    res.json(artisans);
  }
}

module.exports = UserRoutes;
