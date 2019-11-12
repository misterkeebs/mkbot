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
    db.addColumn('artisans', 'created_at', { type: 'timestamp', defaultValue: { toString: () => 'CURRENT_TIMESTAMP' } }),
    db.addColumn('artisans', 'submitted_at', 'datetime')
  ]);
};

exports.down = function(db) {
  return Promise.all([
    db.removeColumn('artisans', 'created_at'),
    db.removeColumn('artisans', 'submitted_at'),
  ]);
};

exports._meta = {
  "version": 1
};
