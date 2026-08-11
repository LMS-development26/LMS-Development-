# Student Authentication Backend - Implementation Summary

## Overview
Your LMS project already had a comprehensive authentication system in place. I have reorganized it to match your requested structure and enhanced it with better error handling and security features.

## Files Created

### 1. `src/models/userModel.js` (NEW)
A dedicated user model that handles all database operations for the users table:
- `findByEmail(email)` - Find user by email
- `findById(id)` - Find user by ID
- `create({ email, password, role })` - Create new user with password hashing
- `verifyPassword(plainPassword, hashedPassword)` - Verify password using bcrypt
- `updateLastLogin(id)` - Update last login timestamp
- `updateFailedAttempts(id, attempts)` - Track failed login attempts
- `lockAccount(id, lockedUntil)` - Lock account after too many failed attempts
- `isAccountLocked(user)` - Check if account is currently locked

### 2. `src/middleware/authMiddleware.js` (NEW)
Renamed from `auth.js` for consistency with your requested structure:
- `protect` - JWT token verification middleware
- `authorize(...roles)` - Role-based authorization middleware

## Files Modified

### 1. `src/controllers/authController.js`
Updated to use the new UserModel instead of direct database queries:
- Replaced direct SQL queries with UserModel methods
- Added account lockout mechanism (5 failed attempts = 30 min lock)
- Enhanced password verification with failed attempt tracking
- Improved error handling and security

### 2. `src/routes/authRoutes.js`
Updated middleware import:
- Changed: `require('../middleware/auth')` 
- To: `require('../middleware/authMiddleware')`

### 3. All Route Files (15 files updated)
Updated middleware imports across all route files for consistency:
- `assignmentRoutes.js`
- `categoryRoutes.js`
- `certificateRoutes.js`
- `courseRoutes.js`
- `enrollmentRoutes.js`
- `instructorRoutes.js`
- `lessonRoutes.js`
- `materialRoutes.js`
- `meetingRoutes.js`
- `moduleRoutes.js`
- `notificationRoutes.js`
- `progressRoutes.js`
- `quizRoutes.js`
- `reviewRoutes.js`
- `tagRoutes.js`

## Database Schema

The existing `users` table already has the required structure:
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role user_role NOT NULL,
    status user_status NOT NULL DEFAULT 'PENDING_VERIFICATION',
    email_verified BOOLEAN DEFAULT FALSE,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### 1. POST /api/auth/register (Student Signup)
**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "STUDENT"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "student@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "full_name": "John Doe",
      "role": "STUDENT"
    },
    "token": "jwt_token_here"
  }
}
```

**Validation:**
- Email must be valid and unique
- Password must be at least 6 characters
- First name and last name are required
- Role defaults to "STUDENT" if not provided

### 2. POST /api/auth/login (Student Login)
**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "student@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "full_name": "John Doe",
      "role": "STUDENT",
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_token_here"
  }
}
```

**Security Features:**
- Password comparison using bcrypt
- Account lockout after 5 failed attempts (30 minutes)
- Failed login attempt tracking
- Last login timestamp update

## Environment Configuration

Ensure your `.env` file has the following configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lms_database
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

## How to Run

### 1. Install Dependencies (if not already installed)
```bash
cd backend
npm install
```

### 2. Set Up Database
```bash
# Run database setup script
npm run setup-db

# Or manually run the schema files from database/schema/
```

### 3. Configure Environment
```bash
# Copy example env file
cp .env.example .env

# Edit .env with your database credentials
```

### 4. Start the Server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on port 5000 (or the port specified in your .env file).

## How to Test APIs

### Using Postman

1. **Import the existing Postman collection** (if available)
2. **Test Registration:**
   - Method: POST
   - URL: `http://localhost:5000/api/auth/register`
   - Body: JSON with email, password, firstName, lastName
   - Expected: 201 status with user data and token

3. **Test Login:**
   - Method: POST
   - URL: `http://localhost:5000/api/auth/login`
   - Body: JSON with email, password
   - Expected: 200 status with user data and token

4. **Test Protected Routes:**
   - Use the token from login in Authorization header
   - Format: `Bearer <your_token>`
   - Try accessing: `http://localhost:5000/api/auth/me`

### Using cURL

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "password123"
  }'
```

**Get Current User (with token):**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <your_token>"
```

## Security Features Implemented

1. **Password Hashing**: All passwords are hashed using bcrypt with salt rounds of 10
2. **JWT Authentication**: Secure token-based authentication with configurable expiration
3. **Account Lockout**: Automatic account lockout after 5 failed login attempts
4. **Email Validation**: Proper email format validation and uniqueness checks
5. **Password Strength**: Minimum 6 character password requirement
6. **Role-Based Access**: Support for STUDENT, INSTRUCTOR, and ADMIN roles
7. **Token Verification**: Secure JWT token verification with error handling

## Integration Notes

- The authentication system is already integrated with your existing Express backend in `server.js`
- All route files have been updated to use the new middleware structure
- The system supports the existing database schema with profiles for students and instructors
- No changes were made to the database schema - it uses the existing structure

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check database credentials in `.env` file
- Verify the database name exists

### JWT Secret Issues
- Make sure `JWT_SECRET` is set in `.env`
- Use a strong, random secret in production

### Port Already in Use
- Change the `PORT` in `.env` file
- Or stop the process using port 5000

## Next Steps

1. Set up your PostgreSQL database with the correct credentials
2. Run the database setup script to create tables
3. Configure your `.env` file with proper credentials
4. Start the server and test the endpoints
5. Integrate with your frontend application

## Existing Features Preserved

The implementation maintains all existing functionality:
- Instructor and Admin role support
- Profile creation for students and instructors
- Email verification tokens (if implemented)
- Login attempt tracking
- User status management
- All existing API endpoints and routes