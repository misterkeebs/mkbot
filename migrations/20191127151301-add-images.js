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
  return db.createTable('images', {
    image_id: { type: 'int', primaryKey: true, autoIncrement: true },
    created_at: { type: 'timestamp', defaultValue: { toString: () => 'CURRENT_TIMESTAMP' } },
    artisan_id: {
      type: 'int', foreignKey: {
        name: 'ix_images_artisans_artisan_id_fk',
        table: 'artisans',
        rules: {
          onDelete: 'CASCADE',
          onUpdate: 'RESTRICT'
        },
        mapping: 'artisan_id'
      }
    },
    image: 'string',
    description: 'string',
    submitted_by: 'string',
    user_id: {
      type: 'int', foreignKey: {
        name: 'ix_images_users_user_id_fk',
        table: 'users',
        rules: {
          onDelete: 'CASCADE',
          onUpdate: 'RESTRICT'
        },
        mapping: 'user_id'
      }
    },
    approved_by: 'int',
    processed_at: 'datetime',
    status: 'string',
  });
};

exports.down = function(db) {
  return db.dropTable('images');
};

exports._meta = {
  "version": 1
};
