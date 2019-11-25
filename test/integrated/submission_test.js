const Nightmare = require('nightmare');
const expect = require('chai').expect;

function login() {
  return new Nightmare()
    .goto('http://localhost:3000/artisans')
    .wait('#qsLoginBtn')
    .click('#qsLoginBtn')
    .wait('[name="email"]')
    .wait(2000)
    .type('[name="email"]', process.env.TEST_EMAIL)
    .type('[name="password"]', process.env.TEST_PASSWORD)
    .click('.auth0-lock-submit')
    .wait(2000)
    .wait('#profileDropDown');
}

describe('login', function() {
  this.timeout('20s');

  it('displays the user badge after login', () => {
    return login().end();
  });
});

describe('searching', () => {
  it('return results', () => {

  });
});
