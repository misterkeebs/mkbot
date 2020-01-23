const User = require('../database/user');
const EmailConfirmation = require('../database/email-confirmation');

class ConfirmationRoute {
  constructor(client, app) {
    this.client = client;
    this.app = app;
  }

  addRoutes() {
    this.app.get('/api/confirm/:token', async (req, res, next) => {
      const { token } = req.params;
      const conf = await EmailConfirmation.find(this.client, { token, confirmed_at: null });
      if (!conf) {
        return res.redirect('/artisans?msg=bad+confirmation');
      }

      const { discord_user_id, email } = conf;
      let user = await User.find(this.client, { discord_user_id }) || await User.find(this.client, { email });
      if (!user) {
        user = await User.create(this.client, { discord_user_id, email });
      } else {
        user.email = conf.email;
        user.discord_user_id = discord_user_id;
        await user.save();
      }

      conf.confirmed_at = new Date();
      await conf.save();

      user.sendPrivateMessage(`Your email **${email}** is now confirmed!`);

      return res.redirect('/artisans?msg=Your+email+is+now+confirmed!');
    });
  }
}

module.exports = ConfirmationRoute;
