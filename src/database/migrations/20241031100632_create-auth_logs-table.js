/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('auth_logs', table => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.enum('action', ['login', 'logout']).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.foreign('user_id').references('id').inTable('users').withKeyName('fk-auth_logs-user_id');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('auth_logs');
};
