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

exports.up = async function(db) {
  await db.createTable('email_confirmations', {
    email_confirmation_id: { type: 'string', primaryKey: true, autoIncrement: true },
    created_at: { type: 'timestamp', defaultValue: { toString: () => 'CURRENT_TIMESTAMP' } },
    token: 'string',
    discord_user_id: 'string',
    email: 'string',
    confirmed_at: { type: 'timestamp' },
  });

  await db.addIndex('email_confirmations', 'ix_email_confirmations_token',
    ['token'], true);

  return await db.addIndex('email_confirmations', 'ix_email_confirmations_discord_user_id',
    ['discord_user_id'], true);
};

exports.down = async function(db) {
  await db.removeIndex('email_confirmations', 'ix_email_confirmations_discord_user_id');

  await db.removeIndex('email_confirmations', 'ix_email_confirmations_token');

  return await db.dropTable('email_confirmations');
};

exports._meta = {
  "version": 1
};
