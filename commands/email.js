const uuidv3 = require('uuid/v3');

const Base = require('./base');
const EmailConfirmation = require('../database/email-confirmation');

class EmailCommand extends Base {
  async run() {
    const [email] = this.getAttrs('email');
    if (!email) return;

    const discord_user_id = this.user.id;
    let conf = await EmailConfirmation.find(this.client, { discord_user_id });
    if (email === 'resend') {
      if (!conf) {
        return this.reply(`You don't have any pending confirmations. Use \`!email [email]\` to confirm your email.`);
      }
    } else {
      if (!conf) {
        conf = await EmailConfirmation.find(this.client, { email });
        if (conf && !conf.discord_user_id) {
          conf.discord_user_id = discord_user_id;
          await conf.save();
        }
      }

      if (conf) {
        return this.reply(`You already have a confirmation pending, to receive it again use \`!email resend\``);
      }

      const token = uuidv3(`${email}-${new Date()}`, process.env.APP_KEY);
      conf = await EmailConfirmation.create(this.client, { email, discord_user_id, token });
    }

    const err = await conf.sendEmail(this.msg.author);

    if (err) {
      return this.reply(`There was an error sending your email confirmation, please try again later.`);
    }

    this.reply(`Confirmation email sent! Please check your email for the confirmation link.`);
  }
}

module.exports = async function(client, msg, content) {
  await new EmailCommand(client, msg, content).run();
};

