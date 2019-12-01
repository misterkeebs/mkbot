const sgMail = require('@sendgrid/mail');
const { log } = require('../debug');
const _ = require('lodash');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

class Email {
  async send(to, subject, body) {
    // we allow using a User instance
    if (_.isObject(to)) {
      if (to.notifications === false) return;
      to = to.email;
    }
    log(`Email "${subject}" to`, to);
    const email = {
      to,
      from: { name: 'MKBot', email: 'mkbot@mrkeebs.com' },
      subject,
      text: body,
    };

    if (process.env.npm_lifecycle_event && process.env.npm_lifecycle_event.indexOf('test') > -1) {
      global.emails = global.emails || [];
      global.emails.push(email);
      return;
    }

    try {
      return await sgMail.send(email);
    } catch (err) {
      console.error('Error sending email', err);
      return err;
    }
  }
}

module.exports = new Email();
