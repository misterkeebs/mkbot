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
    db.addColumn('artisans', 'submission_id', 'int'),
    db.addColumn('submissions', 'processed_by', 'int'),

    db.addForeignKey('artisans', 'submissions', 'fk_artisans_submissions', {
      submission_id: 'submission_id'
    }, {
      onDelete: 'CASCADE',
      onUpdate: 'RESTRICT',
    }),
  ]);
};

exports.down = function(db) {
  return Promise.all([
    db.removeForeignKey('artisans', 'fk_artisans_submissions', {
      dropIndex: true }),

    db.removeColumn('submissions', 'processed_by'),
    db.removeColumn('artisans', 'submission_id'),
  ]);
};

exports._meta = {
  "version": 1
};
