const proxy = require('http-proxy-middleware');
module.exports = function(app) {
  console.log('here');
  app.use(proxy('/api',
    {
      target: 'http://localhost:3001/'
    }
  ));
};
