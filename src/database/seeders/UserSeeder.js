const bcrypt = require('bcryptjs');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  try {
    // Disable foreign key checks
    await knex.raw('SET FOREIGN_KEY_CHECKS = 0');
    
    // Clear the users table
    await knex('users').truncate();

    // Generate password hash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Create seed data
    const users = [
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        provider: 'local',
        email_verified: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Test User',
        email: 'user@example.com',
        password: hashedPassword,
        provider: 'local',
        email_verified: false,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Insert users
    await knex('users').insert(users);
    
    // Re-enable foreign key checks
    await knex.raw('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}; 