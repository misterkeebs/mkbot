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
    db.addColumn('submissions', 'anonymous', 'boolean'),
    db.addColumn('submissions', 'author', 'string'),
  ]);
};

exports.down = function(db) {
  return Promise.all([
    db.removeColumn('submissions', 'anonymous'),
    db.removeColumn('submissions', 'author'),
  ]);
};

exports._meta = {
  "version": 1
};
