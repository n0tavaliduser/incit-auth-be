const bcrypt = require('bcryptjs');
const { Knex } = require('knex');

interface User {
  name: string;
  email: string;
  password: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * @param {Knex} knex
 * @returns {Promise<void>}
 */
exports.seed = async function(knex: any): Promise<void> {
  try {
    // Disable foreign key checks
    await knex.raw('SET FOREIGN_KEY_CHECKS = 0');
    
    // Clear the users table
    await knex('users').truncate();

    // Generate password hash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Insert users
    await knex('users').insert([
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Test User',
        email: 'user@example.com',
        password: hashedPassword,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
    
    // Re-enable foreign key checks
    await knex.raw('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}; 