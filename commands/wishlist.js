const ListCommand = require('./list');

class WishlistCommand extends ListCommand {
  constructor(client, msg, content) {
    super('wishlist', client, msg, content);
  }
}

module.exports = async function(client, msg, content) {
  new WishlistCommand(client, msg, content).run();
};
