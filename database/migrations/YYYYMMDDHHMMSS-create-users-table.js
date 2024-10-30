exports.up = function(knex) {
  return knex.schema.createTable('users', table => {
    table.increments('id').primary();
    table.string('email', 255).unique().notNullable();
    table.string('password', 255).nullable();
    table.string('name', 255).notNullable();
    table.string('oauth_provider', 50).nullable();
    table.string('oauth_id', 255).nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
}; 