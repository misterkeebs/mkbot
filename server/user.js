const _ = require('lodash');

const RouterConfig = require('./router-config');
const User = require('../database/user');
const List = require('../database/list');

class UserRoutes extends RouterConfig {
  routes() {
    this.getAuth('/user', this.getUser.bind(this));
    this.getAuth('/user/list', this.getUserArtisans.bind(this));
    this.getAuth('/user/wishlist', this.getUserWishlist.bind(this));

    this.postAuth('/user/list', this.updateUserArtisans.bind(this));
    this.postAuth('/user/wishlist', this.updateUserWishlist.bind(this));

    this.get('/users/:user_id/:type', this.getPublicUserList.bind(this));
  }

  async getUser(req, res, next) {
    const { userProfile } = req;
    const user = await User.findOrCreate(this.client, { email: userProfile.email });
    res.json(user);
  }

  async getUserList(type, req, res, next) {
    const { userProfile } = req;
    const user = await User.findOrCreate(this.client, { email: userProfile.email });
    const list = await List.findByUser(this.client, type, user.user_id);
    console.log(' *** list', list);
    if (!list) {
      return res.json({ list: null, artisans: null });
    }
    const artisans = await list.getArtisans();
    res.json({ list, artisans });
  }

  async getPublicUserList(req, res, next) {
    const { user_id, type } = req.params;
    const list = await List.findByUser(this.client, type, user_id);
    if (!list || !list.public) {
      return res.status(404).json({ message: 'List not found' });
    }
    const artisans = await list.getArtisans();
    res.json({ list, artisans });
  }

  async updateUserList(type, req, res, next) {
    const { userProfile } = this;
    const isPublic = req.body.public;
    const user = await User.findOrCreate(this.client, { email: userProfile.email });
    const list = await List.findByUser(this.client, type, user.user_id);
    if (!list) {
      return res.json(null);
    }
    list.public = isPublic;
    const savedList = new List(this.client, await list.save());
    res.json(savedList);
  }

  async getUserArtisans(req, res, next) {
    return this.getUserList('list', req, res, next);
  }

  async getUserWishlist(req, res, next) {
    return this.getUserList('wishlist', req, res, next);
  }

  async updateUserArtisans(req, res, next) {
    return this.updateUserList('list', req, res, next);
  }

  async updateUserWishlist(req, res, next) {
    return this.updateUserList('wishlist', req, res, next);
  }
}

module.exports = UserRoutes;
