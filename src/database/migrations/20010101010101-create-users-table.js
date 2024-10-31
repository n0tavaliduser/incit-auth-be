exports.up = function(knex) {
  return knex.schema.createTable('users', table => {
    table.increments('id').primary();
    table.string('email', 255).unique().notNullable();
    table.longtext('picture').nullable();
    table.string('password', 255).nullable();
    table.string('reset_token', 255).nullable();
    table.timestamp('reset_token_expires_at').nullable();
    table.string('name', 255).notNullable();
    table.string('provider', 50).nullable();
    table.string('provider_id', 255).nullable();
    table.string('oauth_provider', 50).nullable();
    table.string('oauth_id', 255).nullable();
    table.boolean('email_verified').notNullable().defaultTo(false);
    table.string('verification_token').nullable();
    table.timestamp('verification_token_expires_at').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
}; 