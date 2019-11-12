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
    db.addForeignKey('list_artisans', 'lists', 'fk_list_artisans_lists', {
      list_id: 'list_id',
    }, {
      onDelete: 'CASCADE',
      onUpdate: 'RESTRICT',
    }),

    db.addIndex('lists', 'ix_lists_unique_type_per_user',
      ['user_id', 'type'], true),

    db.addIndex('list_artisans', 'ix_list_artisans_unique',
      ['list_id', 'artisan_id'], true),
  ]);
};

exports.down = function(db) {
  return Promise.all([
    db.removeIndex('list_artisans', 'ix_list_artisans_unique'),

    db.removeForeignKey('list_artisans', 'fk_list_artisans_lists', {
      dropIndex: true }),
  ]);
};

exports._meta = {
  "version": 1
};
