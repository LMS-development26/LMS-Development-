const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

/**
 * User Model - Handles all database operations for users table
 */
class UserModel {
  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User object or null
   */
  static async findByEmail(email) {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Find user by ID
   * @param {string} id - User ID
   * @returns {Promise<Object|null>} User object or null
   */
  static async findById(id) {
    const result = await query(
      'SELECT id, email, role, status, email_verified, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @param {string} userData.email - User email
   * @param {string} userData.password - Plain text password (will be hashed)
   * @param {string} userData.role - User role (STUDENT, INSTRUCTOR, ADMIN)
   * @returns {Promise<Object>} Created user object
   */
  static async create({ email, password, role = 'STUDENT' }) {
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const result = await query(
      `INSERT INTO users (email, password_hash, role, status, created_at)
       VALUES ($1, $2, $3, 'ACTIVE', CURRENT_TIMESTAMP)
       RETURNING id, email, role, status, created_at`,
      [email, hashedPassword, role]
    );

    return result.rows[0];
  }

  /**
   * Verify user password
   * @param {string} plainPassword - Plain text password
   * @param {string} hashedPassword - Hashed password from database
   * @returns {Promise<boolean>} True if password matches
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Update user's last login timestamp
   * @param {string} id - User ID
   * @returns {Promise<void>}
   */
  static async updateLastLogin(id) {
    await query(
      'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );
  }

  /**
   * Update user failed login attempts
   * @param {string} id - User ID
   * @param {number} attempts - Number of failed attempts
   * @returns {Promise<void>}
   */
  static async updateFailedAttempts(id, attempts) {
    await query(
      'UPDATE users SET failed_login_attempts = $1 WHERE id = $2',
      [attempts, id]
    );
  }

  /**
   * Lock user account
   * @param {string} id - User ID
   * @param {Date} lockedUntil - Date until account is locked
   * @returns {Promise<void>}
   */
  static async lockAccount(id, lockedUntil) {
    await query(
      'UPDATE users SET locked_until = $1 WHERE id = $2',
      [lockedUntil, id]
    );
  }

  /**
   * Check if user account is locked
   * @param {Object} user - User object
   * @returns {boolean} True if account is locked
   */
  static isAccountLocked(user) {
    if (!user.locked_until) return false;
    return new Date(user.locked_until) > new Date();
  }
}

module.exports = UserModel;