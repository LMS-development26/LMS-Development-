const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const secret = process.env.JWT_SECRET || 'lms_secret_key_for_development_2024';
      const decoded = jwt.verify(token, secret);

      // Get user from database
      const result = await query(
        'SELECT id, email, role, first_name, last_name FROM users WHERE id = $1',
        [decoded.id]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({
          success: false,
          error: 'User not found'
        });
      }

      // Attach user to request object
      req.user = result.rows[0];
      next();
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        error: 'Token is invalid or expired'
      });
    }
  } catch (error) {
    next(error);
  }
};

// Check if user has specific role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };