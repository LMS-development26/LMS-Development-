const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let error = { ...err };
  error.message = err.message;

  // PostgreSQL error codes
  if (err.code === '23505') {
    // Unique violation
    error.message = 'A record with this information already exists';
    error.statusCode = 409;
  }

  if (err.code === '23503') {
    // Foreign key violation
    error.message = 'Referenced record does not exist';
    error.statusCode = 400;
  }

  if (err.code === '23502') {
    // Not null violation
    error.message = 'Required field is missing';
    error.statusCode = 400;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token';
    error.statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Token expired';
    error.statusCode = 401;
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    error.message = err.message;
    error.statusCode = 400;
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;