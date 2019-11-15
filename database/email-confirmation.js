const dedent = require('dedent');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const createOrm = require('./orm-base');

module.exports = createOrm('email_confirmations', {
  sendEmail: async function() {
    console.log('Sending to', this.email);
    const email = {
      to: this.email,
      from: { name: 'MKBot', email: 'mkbot@mrkeebs.com' },
      subject: 'Please confirm your email for MKBot',
      text: dedent`
      Hey there,

      Someone, hopefully you, requested to confirm this email to be used
      with MKBot.

      If this request was made by you, please click here to confirm:

      ${process.env.BASE_URL}/confirm/${this.token}

      If you didn't request this, please ignore this email.

      Best,
      MKBot
      `,
    };

    try {
      const res = await sgMail.send(email);
      return;
    } catch (err) {
      console.log('Error sending email', err, err.response.body);
      return err;
    }
  }
});
