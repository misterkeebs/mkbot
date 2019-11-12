const ListCommand = require('./list');

class UserListCommand extends ListCommand {
  constructor(client, msg, content) {
    super('list', client, msg, content);
  }
}

module.exports = async function(client, msg, content) {
  new UserListCommand(client, msg, content).run();
};
