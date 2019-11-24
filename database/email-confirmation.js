const dedent = require('dedent');

const Email = require('./email');
const createOrm = require('./orm-base');

const instanceAdditions = {
  sendEmail: async function(user) {
    Email.send(this.email, 'Please confirm your email for MKBot', dedent`
      Hey there,

      Someone, hopefully you, requested to confirm this email to be used
      with MKBot.

      If you are user ${user.username}#${user.discriminator} on Discord
      and if this request was made by you, please click here to confirm:

      ${process.env.BASE_URL}/api/confirm/${this.token}

      If you didn't request this, please ignore this email.

      Best,
      MKBot
    `);
  }
};

module.exports = createOrm('email_confirmations', { instanceAdditions});
