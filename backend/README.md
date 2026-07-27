# LMS Backend API

A comprehensive Learning Management System backend built with Node.js, Express, and PostgreSQL. This backend provides a modular REST API for managing courses, enrollments, assignments, quizzes, and more.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control (Student, Instructor, Admin)
- **Course Management**: Create, update, and manage courses with modules, lessons, and learning materials
- **Enrollment System**: Enrollment requests and approvals
- **Assignments**: Create assignments, submit work, and grade submissions
- **Quizzes**: Comprehensive quiz system with questions, options, and attempt tracking
- **Live Classes**: Meeting scheduling and attendance tracking
- **Progress Tracking**: Lesson and course progress monitoring
- **Reviews & Certificates**: Course reviews and certificate generation
- **Notifications**: User notification system

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # PostgreSQL connection and query helpers
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── categoryController.js
│   │   ├── courseController.js
│   │   ├── moduleController.js
│   │   ├── lessonController.js
│   │   ├── materialController.js
│   │   ├── enrollmentController.js
│   │   ├── assignmentController.js
│   │   ├── quizController.js
│   │   ├── meetingController.js
│   │   ├── progressController.js
│   │   ├── reviewController.js
│   │   ├── certificateController.js
│   │   └── notificationController.js
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication and authorization
│   │   ├── errorHandler.js      # Global error handling
│   │   ├── notFoundHandler.js   # 404 handler
│   │   └── validation.js        # Request validation
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── courseRoutes.js
│   │   ├── moduleRoutes.js
│   │   ├── lessonRoutes.js
│   │   ├── materialRoutes.js
│   │   ├── enrollmentRoutes.js
│   │   ├── assignmentRoutes.js
│   │   ├── quizRoutes.js
│   │   ├── meetingRoutes.js
│   │   ├── progressRoutes.js
│   │   ├── reviewRoutes.js
│   │   ├── certificateRoutes.js
│   │   └── notificationRoutes.js
│   ├── services/                # Business logic services (if needed)
│   ├── utils/                   # Utility functions
│   ├── models/                  # Data models (if needed)
│   └── server.js                # Main application entry point
├── .env.example                 # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd LMS/backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lms_database
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

4. Set up the database:
```bash
# Create database
createdb lms_database

# Run the database setup script from the database directory
cd ../database
psql -U postgres -d lms_database -f setup_database.sql
```

## Running the Server

Development mode (with hot reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on the specified port (default: 3000).

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication

All protected endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/switch-user` - Switch user (testing)

#### Categories
- `GET /api/categories` - List all categories
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create category (Admin)
- `PUT /api/categories/:id` - Update category (Admin)
- `DELETE /api/categories/:id` - Delete category (Admin)

#### Courses
- `GET /api/courses` - List courses with filters
- `GET /api/courses/:id` - Get single course
- `POST /api/courses` - Create course (Instructor/Admin)
- `PUT /api/courses/:id` - Update course (Instructor/Admin)
- `PATCH /api/courses/:id/status` - Update course status (Instructor/Admin)
- `DELETE /api/courses/:id` - Delete course (Instructor/Admin)
- `POST /api/courses/:id/duplicate` - Duplicate course (Instructor/Admin)

#### Modules
- `GET /api/modules/course/:courseId` - Get modules by course
- `GET /api/modules/:id` - Get single module
- `POST /api/modules` - Create module (Instructor/Admin)
- `PUT /api/modules/:id` - Update module (Instructor/Admin)
- `DELETE /api/modules/:id` - Delete module (Instructor/Admin)

#### Lessons
- `GET /api/lessons/module/:moduleId` - Get lessons by module
- `GET /api/lessons/:id` - Get single lesson
- `POST /api/lessons` - Create lesson (Instructor/Admin)
- `PUT /api/lessons/:id` - Update lesson (Instructor/Admin)
- `DELETE /api/lessons/:id` - Delete lesson (Instructor/Admin)

#### Materials
- `GET /api/materials/lesson/:lessonId` - Get materials by lesson
- `GET /api/materials/:id` - Get single material
- `POST /api/materials` - Create material (Instructor/Admin)
- `PUT /api/materials/:id` - Update material (Instructor/Admin)
- `DELETE /api/materials/:id` - Delete material (Instructor/Admin)

#### Enrollments
- `POST /api/enrollments/requests` - Create enrollment request
- `GET /api/enrollments/requests/course/:courseId` - Get enrollment requests (Instructor/Admin)
- `PUT /api/enrollments/requests/:id/approve` - Approve request (Instructor/Admin)
- `PUT /api/enrollments/requests/:id/reject` - Reject request (Instructor/Admin)
- `POST /api/enrollments` - Direct enrollment
- `GET /api/enrollments/course/:courseId` - Get course enrollments (Instructor/Admin)
- `GET /api/enrollments/student/:studentId` - Get student enrollments
- `GET /api/enrollments/my-enrollments` - Get my enrollments
- `DELETE /api/enrollments/:id` - Cancel enrollment

#### Assignments
- `GET /api/assignments/course/:courseId` - Get assignments by course
- `GET /api/assignments/:id` - Get single assignment
- `POST /api/assignments` - Create assignment (Instructor/Admin)
- `PUT /api/assignments/:id` - Update assignment (Instructor/Admin)
- `DELETE /api/assignments/:id` - Delete assignment (Instructor/Admin)
- `GET /api/assignments/:assignmentId/submissions` - Get submissions (Instructor/Admin)
- `GET /api/assignments/submissions/student/:studentId` - Get student submissions
- `GET /api/assignments/submissions/my-submissions` - Get my submissions
- `POST /api/assignments/submissions` - Create submission
- `PUT /api/assignments/submissions/:id/grade` - Grade submission (Instructor/Admin)
- `DELETE /api/assignments/submissions/:id` - Delete submission

#### Quizzes
- `GET /api/quizzes/course/:courseId` - Get quizzes by course
- `GET /api/quizzes/:id` - Get single quiz with questions
- `POST /api/quizzes` - Create quiz (Instructor/Admin)
- `PUT /api/quizzes/:id` - Update quiz (Instructor/Admin)
- `DELETE /api/quizzes/:id` - Delete quiz (Instructor/Admin)
- `POST /api/quizzes/questions` - Create question (Instructor/Admin)
- `PUT /api/quizzes/questions/:id` - Update question (Instructor/Admin)
- `DELETE /api/quizzes/questions/:id` - Delete question (Instructor/Admin)
- `POST /api/quizzes/options` - Create option (Instructor/Admin)
- `PUT /api/quizzes/options/:id` - Update option (Instructor/Admin)
- `DELETE /api/quizzes/options/:id` - Delete option (Instructor/Admin)
- `POST /api/quizzes/attempts/start` - Start quiz attempt
- `POST /api/quizzes/attempts/submit` - Submit quiz attempt
- `GET /api/quizzes/attempts/results/:studentId` - Get quiz results
- `GET /api/quizzes/attempts/my-results` - Get my quiz results
- `GET /api/quizzes/attempts/quiz/:quizId` - Get quiz attempts (Instructor/Admin)

#### Meetings
- `GET /api/meetings/course/:courseId` - Get meetings by course
- `GET /api/meetings/:id` - Get single meeting
- `POST /api/meetings` - Create meeting (Instructor/Admin)
- `PUT /api/meetings/:id` - Update meeting (Instructor/Admin)
- `DELETE /api/meetings/:id` - Delete meeting (Instructor/Admin)
- `GET /api/meetings/:meetingId/attendance` - Get attendance (Instructor/Admin)
- `POST /api/meetings/:meetingId/join` - Join meeting
- `POST /api/meetings/:meetingId/leave` - Leave meeting
- `GET /api/meetings/attendance/student/:studentId` - Get student attendance
- `GET /api/meetings/attendance/my-attendance` - Get my attendance

#### Progress
- `GET /api/progress/lesson/:lessonId` - Get lesson progress
- `GET /api/progress/course/:courseId/lessons` - Get course lesson progress
- `POST /api/progress/lesson` - Update lesson progress
- `POST /api/progress/lesson/:lessonId/reset` - Reset lesson progress (Instructor/Admin)
- `GET /api/progress/course/:courseId` - Get course progress
- `GET /api/progress/student/:studentId` - Get student progress
- `GET /api/progress/my-progress` - Get my progress
- `GET /api/progress/course/:courseId/overview` - Get course progress overview (Instructor/Admin)

#### Reviews
- `GET /api/reviews/course/:courseId` - Get course reviews
- `GET /api/reviews/:id` - Get single review
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review
- `GET /api/reviews/student/:studentId` - Get student reviews
- `GET /api/reviews/my-reviews` - Get my reviews

#### Certificates
- `GET /api/certificates/student/:studentId` - Get student certificates
- `GET /api/certificates/my-certificates` - Get my certificates
- `GET /api/certificates/:id` - Get single certificate
- `GET /api/certificates/course/:courseId/eligibility` - Check certificate eligibility
- `POST /api/certificates/issue` - Issue certificate
- `GET /api/certificates/verify/:certificateNumber` - Verify certificate
- `PUT /api/certificates/:id/revoke` - Revoke certificate (Admin)
- `GET /api/certificates/course/:courseId/issued` - Get issued certificates (Instructor/Admin)

#### Notifications
- `GET /api/notifications/user/:userId` - Get user notifications
- `GET /api/notifications/my-notifications` - Get my notifications
- `GET /api/notifications/unread-count/:userId` - Get unread count
- `GET /api/notifications/my-unread-count` - Get my unread count
- `GET /api/notifications/:id` - Get single notification
- `POST /api/notifications` - Create notification (Admin)
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/user/:userId/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

## Example Usage

### Register a new user
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "password123",
    "first_name": "John",
    "last_name": "Doe",
    "role": "STUDENT"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "password123"
  }'
```

### Get courses (protected)
```bash
curl -X GET http://localhost:3000/api/courses \
  -H "Authorization: Bearer <token>"
```

### Create a course (instructor/admin)
```bash
curl -X POST http://localhost:3000/api/courses \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "category_id": "category-uuid",
    "title": "Introduction to Programming",
    "description": "Learn programming basics",
    "difficulty": "BEGINNER",
    "price": 0
  }'
```

## User Roles

- **STUDENT**: Can enroll in courses, submit assignments, take quizzes, track progress
- **INSTRUCTOR**: Can create and manage courses, grade assignments, schedule meetings
- **ADMIN**: Full system access including user management and system configuration

## Database Schema

The backend uses PostgreSQL with the following main entities:
- Users and profiles (students, instructors, admins)
- Course management (categories, courses, modules, lessons, materials)
- Enrollment system (requests, enrollments)
- Assignments and submissions
- Quizzes with questions and options
- Meetings and attendance
- Progress tracking
- Reviews and certificates
- Notifications

## Error Handling

The API uses standard HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (authorization required)
- `404` - Not Found
- `409` - Conflict (duplicate entries)
- `500` - Internal Server Error

Error responses follow this format:
```json
{
  "success": false,
  "error": "Error message",
  "details": [] // Additional details for validation errors
}
```

## Development

### Adding New Features

1. Create controller in `src/controllers/`
2. Create routes in `src/routes/`
3. Register routes in `src/server.js`
4. Add validation rules if needed
5. Test the endpoints

### Database Queries

Use the `query` helper from `src/config/database.js`:
```javascript
const { query } = require('../config/database');

const result = await query('SELECT * FROM users WHERE id = $1', [userId]);
```

For transactions, use the `getClient` helper:
```javascript
const client = await query('getClient');
try {
  await client.query('BEGIN');
  // Execute queries
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
}
```

## Security

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- Helmet.js for security headers
- Rate limiting to prevent abuse
- Input validation using express-validator
- SQL injection prevention through parameterized queries

## License

ISC

## Support

For issues and questions, please contact the development team.