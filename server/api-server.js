const jwt = require('express-jwt');
const jwks = require('jwks-rsa');

const UserRoutes = require('./user');
const ListRoutes = require('./list');
const MakerRoutes = require('./makers');
const ArtisanRoutes = require('./artisans');
const SubmissionRoutes = require('./submission');

class ApiServer {
  constructor(client, app) {
    const jwksUri = `${process.env.AUTH0_URL}/.well-known/jwks.json`;
    this.client = client;
    this.app = app;
    this.jwtCheck = jwt({
      secret: jwks.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri
      }),
      audience: 'http://fcoury.pagekite.me/',
      issuer: `${process.env.AUTH0_URL}/`,
      algorithms: ['RS256']
    });
  }

  addRoutes() {
    new UserRoutes(this).routes();
    new ListRoutes(this).routes();
    new MakerRoutes(this).routes();
    new ArtisanRoutes(this).routes();
    new SubmissionRoutes(this).routes();
  }
}

module.exports = ApiServer;
