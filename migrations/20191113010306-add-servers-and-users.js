'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return Promise.all([
    db.createTable('servers', {
      server_id: { type: 'string', primaryKey: true },
      created_at: { type: 'timestamp', defaultValue: { toString: () => 'CURRENT_TIMESTAMP' } },
      whitelist: 'varchar[]',
      blacklist: 'varchar[]',
    }),

    db.createTable('users', {
      user_id: { type: 'int', primaryKey: true, autoIncrement: true },
      created_at: { type: 'timestamp', defaultValue: { toString: () => 'CURRENT_TIMESTAMP' } },
      discord_user_id: 'string',
      email: 'string',
      role: 'string',
    }),
  ]);
};

exports.down = function(db) {
  return Promise.all([
    db.dropTable('servers'),
    db.dropTable('users'),
  ]);
};

exports._meta = {
  "version": 1
};
