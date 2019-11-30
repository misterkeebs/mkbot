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
    db.addColumn('users', 'notifications', { type: 'boolean', defaultValue: true }),
    db.runSql('UPDATE users SET notifications=true'),
  ]);
};

exports.down = function(db) {
  return db.removeColumn('users', 'notifications', 'boolean');
};

exports._meta = {
  "version": 1
};
