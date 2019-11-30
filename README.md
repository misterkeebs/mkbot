# MrKeebs Artisan Catalog Platform
> Community driven catalog of artisan keycaps

## Installation

### Prerequirements

- Windows, Linux or macOS
- JavaScript/Node.js environment
- Yarn
- PostgreSQL
- Auth0 dev account
- Discord app[1]
- [optional] AWS S3 Bucket (for image uploading)
- [optional] Sendgrid Account (for emails)

[1] https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token

You'll also need to add a Rule to your auth0 account as follows:

```javascript
function (user, context, callback) {
  const namespace = 'http://a.mrkeebs.com';
  const assignedRoles = (context.authorization || {}).roles;

  let idTokenClaims = context.idToken || {};
  let accessTokenClaims = context.accessToken || {};

  idTokenClaims[`${namespace}/roles`] = assignedRoles;
  accessTokenClaims[`${namespace}/roles`] = assignedRoles;

  idTokenClaims[`${namespace}/email`] = user.email;
  accessTokenClaims[`${namespace}/email`] = user.email;

  context.idToken = idTokenClaims;
  context.accessToken = accessTokenClaims;

  callback(null, user, context);
}
```

### Installation

Clone the repo

```
git clone https://github.com/misterkeebs/mkbot.git
```

Install the server dependencies

```
cd mkbot
yarn
```

Install the client dependencies

```
cd client
yarn
```

Configure the environment variables

```
cd ~/code/mkbot
cp .env.example .env
cp database.json.example .database.json
```

Edit `.env` with your favorite editor and fill in the blanks

Edit `database.json` if needed

### Preparing the database

Create the postgres database

```
yarn run db-migrate db:create mkbot
```

Execute the migrations

```
fcoury@imac ~/code/mkbot
> $ yarn run db-migrate up --verbose
yarn run v1.19.1
$ /Users/fcoury/code/mkbot/node_modules/.bin/db-migrate up --verbose
[INFO] Detected and using the projects local version of db-migrate. '/Users/fcoury/code/mkbot/node_modules/db-migrate/index.js'
[INFO] Using dev settings: { driver: 'pg', host: 'localhost', database: 'mkbot' }
[INFO] require: db-migrate-pg
[INFO] connecting
[INFO] connected
...
[SQL] COMMIT;
[INFO] Done
✨  Done in 0.85s.
```

## Running

### Web App Server

```
cd ~/code/mkbot
yarn server
```

After a bit the server should start on port 3001:

```
> $ yarn server
yarn run v1.19.1
$ nodemon server.js
[nodemon] 2.0.0
[nodemon] to restart at any time, enter `rs`
[nodemon] watching dir(s): *.*
[nodemon] watching extensions: js,mjs,json
[nodemon] starting `node server.js`
Server listening on port 3001!
```

### Web App Client

```
cd ~/code/mkbot
yarn client
```

The webapp will open on port 3000 and API calls will be proxied to the server. If by any reason you need to change it, just check the `client/src/setupProxy.js`.

At this point you can start working on the application

### Discord bot

```
cd ~/code/mkbot
yarn bot
yarn run v1.19.1
$ nodemon index.js
[nodemon] 2.0.0
[nodemon] to restart at any time, enter `rs`
[nodemon] watching dir(s): *.*
[nodemon] watching extensions: js,mjs,json
[nodemon] starting `node index.js`
Logged in as MKBot Dev#6607!
```
