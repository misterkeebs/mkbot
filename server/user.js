const _ = require('lodash');

const RouterConfig = require('./router-config');
const User = require('../database/user');
const List = require('../database/list');

class UserRoutes extends RouterConfig {
  routes() {
    this.getAuth('/user', this.getUser.bind(this));
    this.getAuth('/user/list', this.getUserArtisans.bind(this));
    this.getAuth('/user/wishlist', this.getUserWishlist.bind(this));
  }

  async getUser(req, res, next) {
    const { userProfile } = req;
    const user = await User.findOrCreate(this.client, { email: userProfile.email });
    res.json(user);
  }

  async getUserList(type, req, res, next) {
    const { userProfile } = req;
    const user = await User.findOrCreate(this.client, { email: userProfile.email });
    const list = await List.findByUser(this.client, type, user.discord_user_id);
    console.log(' *** list', list);
    if (!list) {
      return res.json(null);
    }
    const artisans = await list.getArtisans();
    res.json(artisans);
  }

  async getUserArtisans(req, res, next) {
    return this.getUserList('list', req, res, next);
  }

  async getUserWishlist(req, res, next) {
    return this.getUserList('wishlist', req, res, next);
  }
}

module.exports = UserRoutes;
