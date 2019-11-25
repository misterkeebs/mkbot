const expect = require('chai').expect;
const { connect, query } = require('../support');

const User = require('../../database/user');
const Submission = require('../../database/submission');

describe('submission', () => {
  let client;
  before(async () => {
    client = await connect();
  });

  describe('creating new submission', () => {
    it('sets the user nickname if author is set', async () => {
      const user = await User.create(client, { email: 'felipe@coury.com.br' });
      const sub = await Submission.create(client, {
        user: 'felipe@coury.com.br',
        user_id: user.user_id,
        maker: 'MAKER',
        sculpt: 'SCULPT',
        colorway: 'COLORWAY',
        image: 'IMAGE',
        anonymous: 'false',
        author: 'mynick',
      });
      const newUser = await user.reload();
      expect(newUser.nickname).to.eql('mynick');
    });
  });
});
