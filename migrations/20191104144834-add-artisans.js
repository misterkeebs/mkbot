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
  return db.createTable('artisans', {
    artisan_id: { type: 'int', primaryKey: true, autoIncrement: true },
    maker_id: 'int',
    collection: 'string',
    sculpt: 'string',
    colorway: 'string',
    image: 'string',
  });
};

exports.down = function(db) {
  return db.dropTable('artisans');
};

exports._meta = {
  "version": 1
};
