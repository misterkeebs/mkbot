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
    db.createTable('lists', {
      list_id: { type: 'int', primaryKey: true, autoIncrement: true },
      created_at: { type: 'timestamp', defaultValue: { toString: () => 'CURRENT_TIMESTAMP' } },
      user_id: 'string',
      user: 'string',
      type: 'string',
      name: 'string',
    }),

    db.createTable('list_artisans', {
      list_artisan_id: { type: 'int', primaryKey: true, autoIncrement: true },
      created_at: { type: 'timestamp', defaultValue: { toString: () => 'CURRENT_TIMESTAMP' } },
      list_id: 'int',
      artisan_id: 'int',
      note: 'string',
    }),
  ]);
};

exports.down = function(db) {
  return Promise.all([
    db.dropTable('lists'),
    db.dropTable('list_artisans'),
  ]);
};

exports._meta = {
  "version": 1
};
