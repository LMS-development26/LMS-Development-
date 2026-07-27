const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// Generate JWT Token
const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'lms_secret_key_for_development_2024';
  return jwt.sign({ id: userId }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Register new user
const register = async (req, res, next) => {
  try {
    const { email, password, full_name, role } = req.body;

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const result = await query(
      `INSERT INTO users (email, password_hash, role, status, created_at)
       VALUES ($1, $2, $3, 'ACTIVE', CURRENT_TIMESTAMP)
       RETURNING id, email, role, created_at`,
      [email, hashedPassword, role || 'STUDENT']
    );

    const user = result.rows[0];

    // Create profile based on role
    if (user.role === 'INSTRUCTOR') {
      await query(
        'INSERT INTO instructor_profiles (user_id, full_name) VALUES ($1, $2)',
        [user.id, full_name || 'Instructor']
      );
    } else if (user.role === 'STUDENT') {
      await query(
        'INSERT INTO student_profiles (user_id, full_name) VALUES ($1, $2)',
        [user.id, full_name || 'Student']
      );
    }

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          full_name: full_name,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// Login user
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const user = result.rows[0];

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      return res.status(401).json({
        success: false,
        error: 'Account is not active'
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Get profile based on role
    let profile = null;
    if (user.role === 'INSTRUCTOR') {
      const profileResult = await query(
        'SELECT * FROM instructor_profiles WHERE user_id = $1',
        [user.id]
      );
      if (profileResult.rows.length > 0) {
        profile = profileResult.rows[0];
      }
    } else if (user.role === 'STUDENT') {
      const profileResult = await query(
        'SELECT * FROM student_profiles WHERE user_id = $1',
        [user.id]
      );
      if (profileResult.rows.length > 0) {
        profile = profileResult.rows[0];
      }
    }

    // Generate token
    const token = generateToken(user.id);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          full_name: profile?.full_name,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get current user
const getCurrentUser = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT id, email, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = result.rows[0];

    // Get profile based on role
    let profile = null;
    if (user.role === 'INSTRUCTOR') {
      const profileResult = await query(
        'SELECT * FROM instructor_profiles WHERE user_id = $1',
        [user.id]
      );
      if (profileResult.rows.length > 0) {
        profile = profileResult.rows[0];
      }
    } else if (user.role === 'STUDENT') {
      const profileResult = await query(
        'SELECT * FROM student_profiles WHERE user_id = $1',
        [user.id]
      );
      if (profileResult.rows.length > 0) {
        profile = profileResult.rows[0];
      }
    }

    res.json({
      success: true,
      data: {
        user: {
          ...user,
          full_name: profile?.full_name
        },
        profile
      }
    });
  } catch (error) {
    next(error);
  }
};

// Switch user (for testing purposes)
const switchUser = async (req, res, next) => {
  try {
    const { userId } = req.body;

    const result = await query(
      'SELECT id, email, role FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = result.rows[0];

    // Get profile based on role
    let profile = null;
    if (user.role === 'INSTRUCTOR') {
      const profileResult = await query(
        'SELECT * FROM instructor_profiles WHERE user_id = $1',
        [user.id]
      );
      if (profileResult.rows.length > 0) {
        profile = profileResult.rows[0];
      }
    } else if (user.role === 'STUDENT') {
      const profileResult = await query(
        'SELECT * FROM student_profiles WHERE user_id = $1',
        [user.id]
      );
      if (profileResult.rows.length > 0) {
        profile = profileResult.rows[0];
      }
    }

    const token = generateToken(user.id);

    res.json({
      success: true,
      data: {
        user: {
          ...user,
          full_name: profile?.full_name
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  switchUser
};