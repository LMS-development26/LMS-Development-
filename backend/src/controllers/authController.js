const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const UserModel = require('../models/userModel');

// Generate JWT Token
const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Register new user
const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, role, expertise, bio } = req.body;

    // Combine first and last name
    const full_name = `${firstName} ${lastName}`;

    // Check if user already exists using UserModel
    const existingUser = await UserModel.findByEmail(email);

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Create user using UserModel
    const user = await UserModel.create({
      email,
      password,
      role: role || 'STUDENT'
    });

    // Create profile based on role
    if (user.role === 'INSTRUCTOR') {
      await query(
        `INSERT INTO instructor_profiles (user_id, full_name, bio, qualification) 
         VALUES ($1, $2, $3, $4)`,
        [user.id, full_name, bio || null, expertise || null]
      );
    } else if (user.role === 'STUDENT') {
      await query(
        'INSERT INTO student_profiles (user_id, full_name) VALUES ($1, $2)',
        [user.id, full_name]
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
          first_name: firstName,
          last_name: lastName,
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

const user = result.rows && result.rows.length > 0 ? result.rows[0] : null;

if (!user) {
  return res.status(401).json({
    success: false,
    error: 'Invalid credentials'
  });
}

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      return res.status(401).json({
        success: false,
        error: 'Account is not active'
      });
    }

    // Check if account is locked
    if (UserModel.isAccountLocked(user)) {
      return res.status(401).json({
        success: false,
        error: 'Account is temporarily locked due to too many failed login attempts'
      });
    }

    // Verify password using UserModel
    const isMatch = await UserModel.verifyPassword(password, user.password_hash);

    if (!isMatch) {
      // Increment failed login attempts
      const newAttempts = (user.failed_login_attempts || 0) + 1;
      await UserModel.updateFailedAttempts(user.id, newAttempts);

      // Lock account if too many failed attempts (5 attempts)
      if (newAttempts >= 5) {
        const lockUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
        await UserModel.lockAccount(user.id, lockUntil);
      }

      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Reset failed login attempts on successful login
    if (user.failed_login_attempts > 0) {
      await UserModel.updateFailedAttempts(user.id, 0);
    }

    // Update last login
    await UserModel.updateLastLogin(user.id);

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

    // Split full_name into first_name and last_name
    const names = (profile?.full_name || '').split(' ');
    const first_name = names[0] || '';
    const last_name = names.slice(1).join(' ') || '';

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          first_name: first_name,
          last_name: last_name,
          full_name: profile?.full_name,
          role: user.role,
          created_at: user.created_at
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
    const user = await UserModel.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
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

    // Split full_name into first_name and last_name
    const names = (profile?.full_name || '').split(' ');
    const first_name = names[0] || '';
    const last_name = names.slice(1).join(' ') || '';

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          status: user.status,
          created_at: user.created_at,
          first_name: first_name,
          last_name: last_name,
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

    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
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

    // Split full_name into first_name and last_name
    const names = (profile?.full_name || '').split(' ');
    const first_name = names[0] || '';
    const last_name = names.slice(1).join(' ') || '';

    const token = generateToken(user.id);

    res.json({
      success: true,
      data: {
        user: {
          ...user,
          first_name: first_name,
          last_name: last_name,
          full_name: profile?.full_name
        },
        token
      }
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
  return res.status(500).json({
    success: false,
    error: error.message,
    detail: error.detail
  });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  switchUser
};