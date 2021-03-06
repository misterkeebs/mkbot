const _ = require('lodash');

const RouterConfig = require('./router-config');
const User = require('../database/user');
const List = require('../database/list');

class UserRoutes extends RouterConfig {
  routes() {
    this.getAuth('/user', this.getUser.bind(this));
    this.getAuth('/user/list', this.getUserArtisans.bind(this));
    this.getAuth('/user/wishlist', this.getUserWishlist.bind(this));

    this.postAuth('/user', this.updateUser.bind(this));
    this.postAuth('/user/list', this.updateUserArtisans.bind(this));
    this.postAuth('/user/wishlist', this.updateUserWishlist.bind(this));

    this.get('/users/:user_id/:type', this.getPublicUserList.bind(this));
  }

  async getUser(req, res, next) {
    res.json(this.user);
  }

  async getUserList(type, req, res, next) {
    const { userEmail } = this;
    const user = await User.findOrCreate(this.client, { email: userEmail });
    const list = await List.findByUser(this.client, type, user.user_id);
    if (!list) {
      return res.json({ list: null, artisans: null });
    }
    const artisans = await list.getArtisans();
    res.json({ user, list, artisans });
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
    const list = await List.findByUser(this.client, type, this.user.user_id);
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

  async updateUser(req, res, next) {
    const { body } = req;
    Object.keys(body).forEach(k => {
      this.user[k] = body[k];
    });
    const user = await this.user.save();
    res.json(user);
  }

  async updateUserArtisans(req, res, next) {
    return this.updateUserList('list', req, res, next);
  }

  async updateUserWishlist(req, res, next) {
    return this.updateUserList('wishlist', req, res, next);
  }
}

module.exports = UserRoutes;
