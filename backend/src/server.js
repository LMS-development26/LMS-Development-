require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');

// Initialize database connection
const { pool } = require('./config/database');

// Import routes
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const courseRoutes = require('./routes/courseRoutes');
const moduleRoutes = require('./routes/moduleRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const materialRoutes = require('./routes/materialRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const quizRoutes = require('./routes/quizRoutes');
const meetingRoutes = require('./routes/meetingRoutes');
const progressRoutes = require('./routes/progressRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const instructorRoutes = require('./routes/instructorRoutes');
const studentRoutes = require('./routes/studentRoutes');
const tagRoutes = require('./routes/tagRoutes');

// ✅ NEW: Users route (simple inline route for now)
const userRoutes = require('express').Router();
const { protect } = require('./middleware/authMiddleware');
const studentController = require('./controllers/studentController');

userRoutes.get('/profile', protect, studentController.getMyProfile);
userRoutes.put('/profile', protect, studentController.updateMyProfile);

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const notFoundHandler = require('./middleware/notFoundHandler');

const app = express();

/* =========================
   SECURITY MIDDLEWARE
========================= */
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:", "http://localhost:5000"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "http://localhost:5000"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy:
    process.env.NODE_ENV === 'production'
      ? { policy: "require-corp" }
      : false,
}));

/* =========================
   CORS
========================= */
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:5175'
    ];

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

/* =========================
   OTHER MIDDLEWARE
========================= */
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Timeout
app.use((req, res, next) => {
  res.setTimeout(30000, () => {
    res.status(504).json({
      success: false,
      error: 'Request timeout'
    });
  });
  next();
});

// Static files
app.use('/uploads', cors(), express.static(path.join(__dirname, '../uploads')));

/* =========================
   ✅ BASIC ROUTES (FIXED)
========================= */

// ✅ Root route (FIX for "/")
app.get('/', (req, res) => {
  res.send('API running');
});

// ✅ Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// ✅ Users route (FIX for "/api/users")
app.use('/api/users', userRoutes);

/* =========================
   API ROUTES
========================= */
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/instructors', instructorRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/tags', tagRoutes);

/* =========================
   ERROR HANDLING
========================= */
app.use(notFoundHandler);
app.use(errorHandler);

/* =========================
   DB CHECK + SERVER START
========================= */
pool.query('SELECT NOW()', (err) => {
  if (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  } else {
    console.log('Database connected successfully');
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;