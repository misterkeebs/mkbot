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
  return db.createTable('submissions', {
    submission_id: { type: 'int', primaryKey: true, autoIncrement: true },
    created_at: { type: 'timestamp', defaultValue: { toString: () => 'CURRENT_TIMESTAMP' } },
    processed_at: 'datetime',
    user: 'string',
    user_id: 'string',
    maker: 'string',
    collection: 'string',
    sculpt: 'string',
    colorway: 'string',
    image: 'string',
    status: 'string',
  });
};

exports.down = function(db) {
  return db.dropTable('submissions');
};

exports._meta = {
  "version": 1
};
