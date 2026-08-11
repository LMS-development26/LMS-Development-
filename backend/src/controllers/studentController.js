const { query } = require('../config/database');

// Get student profile (public - by user ID)
const getProfile = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const result = await query(
      `SELECT sp.*, u.email, u.role, u.status, u.created_at
       FROM student_profiles sp
       JOIN users u ON sp.user_id = u.id
       WHERE sp.user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Student profile not found'
      });
    }

    const profile = result.rows[0];

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

// Get current student's profile (protected - uses JWT)
const getMyProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await query(
      `SELECT sp.*, u.email, u.role, u.status, u.created_at, u.last_login_at
       FROM student_profiles sp
       JOIN users u ON sp.user_id = u.id
       WHERE sp.user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Student profile not found'
      });
    }

    const profile = result.rows[0];

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

// Update current student's profile (protected)
const updateMyProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { full_name, bio, phone_number, qualification, college_name, current_year } = req.body;

    // Check if profile exists
    const existingProfile = await query(
      'SELECT id FROM student_profiles WHERE user_id = $1',
      [userId]
    );

    let result;
    if (existingProfile.rows.length === 0) {
      // Create new profile
      result = await query(
        `INSERT INTO student_profiles (user_id, full_name, bio, phone_number, qualification, college_name, current_year)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [userId, full_name || '', bio || null, phone_number || null, qualification || null, college_name || null, current_year || null]
      );
    } else {
      // Update existing profile
      result = await query(
        `UPDATE student_profiles
         SET full_name = COALESCE($2, full_name),
             bio = COALESCE($3, bio),
             phone_number = COALESCE($4, phone_number),
             qualification = COALESCE($5, qualification),
             college_name = COALESCE($6, college_name),
             current_year = COALESCE($7, current_year),
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $1
         RETURNING *`,
        [userId, full_name, bio, phone_number, qualification, college_name, current_year]
      );
    }

    // Log activity
    await logActivity(userId, 'PROFILE_UPDATE', 'Updated profile information');

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Get current student's enrolled courses (protected)
const getMyCourses = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    const result = await query(
      `SELECT
        e.id as enrollment_id,
        e.student_id,
        e.course_id,
        e.enrolled_at,
        c.title,
        c.subtitle,
        c.description,
        c.difficulty,
        c.thumbnail_url,
        c.duration_hours,
        c.price,
        c.status as course_status,
        cat.category_name,
        u.email as instructor_email,
        ip.full_name as instructor_name,
        cp.progress_percentage,
        cp.completion_date
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       JOIN course_categories cat ON c.category_id = cat.id
       JOIN users u ON c.instructor_id = u.id
       LEFT JOIN instructor_profiles ip ON u.id = ip.user_id
       LEFT JOIN course_progress cp ON e.course_id = cp.course_id AND e.student_id = cp.student_id
       WHERE e.student_id = $1
       ORDER BY e.enrolled_at DESC`,
      [studentId]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

// Get specific course details for enrolled student (protected)
const getCourseDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const studentId = req.user.id;

    // First check if student is enrolled in this course
    const enrollmentCheck = await query(
      'SELECT * FROM enrollments WHERE student_id = $1 AND course_id = $2',
      [studentId, id]
    );

    if (enrollmentCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'You are not enrolled in this course'
      });
    }

    // Get course details with modules and lessons
    const courseResult = await query(
      `SELECT
        c.*,
        cat.category_name,
        u.email as instructor_email,
        ip.full_name as instructor_name,
        ip.bio as instructor_bio,
        ip.qualification as instructor_qualification
       FROM courses c
       JOIN course_categories cat ON c.category_id = cat.id
       JOIN users u ON c.instructor_id = u.id
       LEFT JOIN instructor_profiles ip ON u.id = ip.user_id
       WHERE c.id = $1`,
      [id]
    );

    if (courseResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    const course = courseResult.rows[0];

    // Get course modules
    const modulesResult = await query(
      `SELECT cm.*,
        (SELECT COUNT(*) FROM lessons l WHERE l.module_id = cm.id) as lesson_count
       FROM course_modules cm
       WHERE cm.course_id = $1
       ORDER BY cm.display_order`,
      [id]
    );

    // Get lessons for each module
    const modulesWithLessons = await Promise.all(
      modulesResult.rows.map(async (module) => {
        const lessonsResult = await query(
          `SELECT l.*,
            (SELECT COUNT(*) FROM learning_materials lm WHERE lm.lesson_id = l.id) as material_count
           FROM lessons l
           WHERE l.module_id = $1
           ORDER BY l.lesson_order`,
          [module.id]
        );

        return {
          ...module,
          lessons: lessonsResult.rows
        };
      })
    );

    // Get enrollment info
    const enrollment = enrollmentCheck.rows[0];

    // Get progress for this course
    const progressResult = await query(
      `SELECT
        cp.*,
        (SELECT COUNT(*) FROM lesson_progress lp
         JOIN lessons l ON lp.lesson_id = l.id
         JOIN course_modules cm ON l.module_id = cm.id
         WHERE cm.course_id = $1 AND lp.student_id = $2 AND lp.completion_status = true) as completed_lessons,
        (SELECT COUNT(*) FROM lessons l JOIN course_modules cm ON l.module_id = cm.id WHERE cm.course_id = $1) as total_lessons
       FROM course_progress cp
       WHERE cp.course_id = $1 AND cp.student_id = $2`,
      [id, studentId]
    );

    const progress = progressResult.rows.length > 0 ? progressResult.rows[0] : null;

    res.json({
      success: true,
      data: {
        course: {
          ...course,
          modules: modulesWithLessons
        },
        enrollment,
        progress
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get student dashboard data (protected)
const getDashboardData = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    // Get total enrolled courses
    const totalCoursesResult = await query(
      'SELECT COUNT(*) as count FROM enrollments WHERE student_id = $1',
      [studentId]
    );
    const totalEnrolledCourses = parseInt(totalCoursesResult.rows[0].count);

    // Get completed courses (using course_progress completion_date)
    const completedCoursesResult = await query(
      'SELECT COUNT(*) as count FROM course_progress WHERE student_id = $1 AND completion_date IS NOT NULL',
      [studentId]
    );
    const completedCourses = parseInt(completedCoursesResult.rows[0].count);

    // Get in-progress courses
    const inProgressCourses = totalEnrolledCourses - completedCourses;

    // Calculate overall progress percentage
    const progressResult = await query(
      `SELECT COALESCE(AVG(progress_percentage), 0) as avg_progress
       FROM course_progress
       WHERE student_id = $1`,
      [studentId]
    );
    const overallProgressPercentage = Math.round(parseFloat(progressResult.rows[0].avg_progress));

    // Get recent enrollments (last 5)
    const recentActivitiesResult = await query(
      `SELECT e.*, c.title as course_title
       FROM enrollments e
       LEFT JOIN courses c ON e.course_id = c.id
       WHERE e.student_id = $1
       ORDER BY e.enrolled_at DESC
       LIMIT 5`,
      [studentId]
    );

    // Get recent courses for quick access
    const recentCoursesResult = await query(
      `SELECT
        c.id,
        c.title,
        c.thumbnail_url,
        c.difficulty,
        cp.progress_percentage,
        e.enrolled_at
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       LEFT JOIN course_progress cp ON e.course_id = cp.course_id AND e.student_id = cp.student_id
       WHERE e.student_id = $1
       ORDER BY e.enrolled_at DESC
       LIMIT 5`,
      [studentId]
    );

    res.json({
      success: true,
      data: {
        totalEnrolledCourses,
        completedCourses,
        inProgressCourses,
        overallProgressPercentage,
        recentActivities: recentActivitiesResult.rows,
        recentCourses: recentCoursesResult.rows,
        upcomingDeadlines: []
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get student activity history (protected)
const getActivityHistory = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { limit = 20, offset = 0 } = req.query;

    const result = await query(
      `SELECT sa.*, c.title as course_title
       FROM student_activities sa
       LEFT JOIN courses c ON sa.course_id = c.id
       WHERE sa.user_id = $1
       ORDER BY sa.created_at DESC
       LIMIT $2 OFFSET $3`,
      [studentId, parseInt(limit), parseInt(offset)]
    );

    // Get total count for pagination
    const countResult = await query(
      'SELECT COUNT(*) as count FROM student_activities WHERE user_id = $1',
      [studentId]
    );
    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: {
        activities: result.rows,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: parseInt(offset) + parseInt(limit) < total
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to log student activities
const logActivity = async (userId, activityType, message, courseId = null, metadata = {}) => {
  try {
    await query(
      `INSERT INTO student_activities (user_id, activity_type, message, course_id, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, activityType, message, courseId, JSON.stringify(metadata)]
    );
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw error - activity logging shouldn't break main flow
  }
};

module.exports = {
  getProfile,
  getMyProfile,
  updateMyProfile,
  getMyCourses,
  getCourseDetails,
  getDashboardData,
  getActivityHistory,
  logActivity
};