const { query } = require('../config/database');

// Helper function to build course filters
const buildCourseFilters = (filters) => {
  const conditions = [];
  const params = [];
  let paramIndex = 1;

  if (filters.instructorId) {
    conditions.push(`c.instructor_id = $${paramIndex++}`);
    params.push(filters.instructorId);
  }

  if (filters.status) {
    conditions.push(`c.status = $${paramIndex++}`);
    params.push(filters.status);
  }

  if (filters.categoryId) {
    conditions.push(`c.category_id = $${paramIndex++}`);
    params.push(filters.categoryId);
  }

  if (filters.language) {
    conditions.push(`c.language = $${paramIndex++}`);
    params.push(filters.language);
  }

  if (filters.priceType === 'free') {
    conditions.push(`c.price = 0`);
  } else if (filters.priceType === 'paid') {
    conditions.push(`c.price > 0`);
  }

  if (filters.search) {
    conditions.push(`(c.title ILIKE $${paramIndex++} OR c.subtitle ILIKE $${paramIndex++} OR c.description ILIKE $${paramIndex++})`);
    const searchTerm = `%${filters.search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  return { conditions, params };
};

// Helper function to build sorting
const buildSorting = (sortBy) => {
  switch (sortBy) {
    case 'popularity':
      return 'ORDER BY c.enrollment_count DESC';
    case 'newest':
      return 'ORDER BY c.created_at DESC';
    case 'rating':
      return 'ORDER BY c.average_rating DESC NULLS LAST';
    case 'price_low':
      return 'ORDER BY c.price ASC';
    case 'price_high':
      return 'ORDER BY c.price DESC';
    default:
      return 'ORDER BY c.created_at DESC';
  }
};

// Get all courses with filters
const listCourses = async (req, res, next) => {
  try {
    const filters = {
      instructorId: req.query.instructorId,
      status: req.query.status,
      categoryId: req.query.categoryId,
      language: req.query.language,
      priceType: req.query.priceType,
      search: req.query.search,
      sortBy: req.query.sortBy
    };

    const { conditions, params } = buildCourseFilters(filters);
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sorting = buildSorting(filters.sortBy);

    const queryText = `
      SELECT c.*,
        u.first_name || ' ' || u.last_name as instructor_name,
        cat.name as category_name,
        COALESCE(e.enrollment_count, 0) as enrollment_count,
        COALESCE(r.average_rating, 0) as average_rating,
        COALESCE(r.review_count, 0) as review_count
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.id
      LEFT JOIN course_categories cat ON c.category_id = cat.id
      LEFT JOIN (
        SELECT course_id, COUNT(*) as enrollment_count
        FROM enrollments
        GROUP BY course_id
      ) e ON c.id = e.course_id
      LEFT JOIN (
        SELECT course_id, 
               AVG(rating) as average_rating, 
               COUNT(*) as review_count
        FROM course_reviews
        GROUP BY course_id
      ) r ON c.id = r.course_id
      ${whereClause}
      ${sorting}
    `;

    const result = await query(queryText, params);

    // Get tags for each course
    const coursesWithTags = await Promise.all(
      result.rows.map(async (course) => {
        const tagsResult = await query(
          `SELECT t.* FROM course_tags t
           JOIN course_tag_mapping ctm ON t.id = ctm.tag_id
           WHERE ctm.course_id = $1`,
          [course.id]
        );
        return { ...course, tags: tagsResult.rows };
      })
    );

    res.json({
      success: true,
      data: coursesWithTags
    });
  } catch (error) {
    next(error);
  }
};

// Get single course by ID
const getCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    const courseResult = await query(
      `SELECT c.*,
        u.first_name || ' ' || u.last_name as instructor_name,
        cat.name as category_name,
        COALESCE(e.enrollment_count, 0) as enrollment_count,
        COALESCE(r.average_rating, 0) as average_rating,
        COALESCE(r.review_count, 0) as review_count
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.id
      LEFT JOIN course_categories cat ON c.category_id = cat.id
      LEFT JOIN (
        SELECT course_id, COUNT(*) as enrollment_count
        FROM enrollments
        GROUP BY course_id
      ) e ON c.id = e.course_id
      LEFT JOIN (
        SELECT course_id, 
               AVG(rating) as average_rating, 
               COUNT(*) as review_count
        FROM course_reviews
        GROUP BY course_id
      ) r ON c.id = r.course_id
      WHERE c.id = $1`,
      [id]
    );

    if (courseResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Get tags
    const tagsResult = await query(
      `SELECT t.* FROM course_tags t
       JOIN course_tag_mapping ctm ON t.id = ctm.tag_id
       WHERE ctm.course_id = $1`,
      [id]
    );

    const course = { ...courseResult.rows[0], tags: tagsResult.rows };

    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    next(error);
  }
};

// Create new course
const createCourse = async (req, res, next) => {
  try {
    const {
      instructor_id,
      category_id,
      title,
      subtitle,
      description,
      difficulty,
      language,
      price,
      thumbnail_url,
      promotional_video_url,
      duration_hours,
      learning_outcomes,
      prerequisites,
      status,
      tags
    } = req.body;

    const client = await query('getClient');
    
    try {
      await client.query('BEGIN');

      const courseResult = await client.query(
        `INSERT INTO courses (
          instructor_id, category_id, title, subtitle, description,
          difficulty, language, price, thumbnail_url, promotional_video_url,
          duration_hours, learning_outcomes, prerequisites, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *`,
        [
          instructor_id || req.user.id,
          category_id,
          title,
          subtitle,
          description,
          difficulty || 'BEGINNER',
          language || 'English',
          price || 0,
          thumbnail_url,
          promotional_video_url,
          duration_hours,
          learning_outcomes,
          prerequisites,
          status || 'DRAFT'
        ]
      );

      const course = courseResult.rows[0];

      // Add tags if provided
      if (tags && tags.length > 0) {
        for (const tagId of tags) {
          await client.query(
            'INSERT INTO course_tag_mapping (course_id, tag_id) VALUES ($1, $2)',
            [course.id, tagId]
          );
        }
      }

      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        data: course
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};

// Update course
const updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      subtitle,
      description,
      difficulty,
      language,
      price,
      thumbnail_url,
      promotional_video_url,
      duration_hours,
      learning_outcomes,
      prerequisites,
      status,
      tags
    } = req.body;

    const client = await query('getClient');
    
    try {
      await client.query('BEGIN');

      const courseResult = await client.query(
        `UPDATE courses
         SET title = COALESCE($1, title),
             subtitle = COALESCE($2, subtitle),
             description = COALESCE($3, description),
             difficulty = COALESCE($4, difficulty),
             language = COALESCE($5, language),
             price = COALESCE($6, price),
             thumbnail_url = COALESCE($7, thumbnail_url),
             promotional_video_url = COALESCE($8, promotional_video_url),
             duration_hours = COALESCE($9, duration_hours),
             learning_outcomes = COALESCE($10, learning_outcomes),
             prerequisites = COALESCE($11, prerequisites),
             status = COALESCE($12, status),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $13
         RETURNING *`,
        [title, subtitle, description, difficulty, language, price, thumbnail_url,
         promotional_video_url, duration_hours, learning_outcomes, prerequisites, status, id]
      );

      if (courseResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          error: 'Course not found'
        });
      }

      // Update tags if provided
      if (tags !== undefined) {
        // Remove existing tags
        await client.query(
          'DELETE FROM course_tag_mapping WHERE course_id = $1',
          [id]
        );

        // Add new tags
        if (tags.length > 0) {
          for (const tagId of tags) {
            await client.query(
              'INSERT INTO course_tag_mapping (course_id, tag_id) VALUES ($1, $2)',
              [id, tagId]
            );
          }
        }
      }

      await client.query('COMMIT');

      res.json({
        success: true,
        data: courseResult.rows[0]
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};

// Update course status
const updateCourseStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await query(
      `UPDATE courses
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Delete course
const deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM courses WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Duplicate course
const duplicateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    const client = await query('getClient');
    
    try {
      await client.query('BEGIN');

      // Get original course
      const originalResult = await client.query(
        'SELECT * FROM courses WHERE id = $1',
        [id]
      );

      if (originalResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          error: 'Course not found'
        });
      }

      const original = originalResult.rows[0];

      // Create duplicate
      const duplicateResult = await client.query(
        `INSERT INTO courses (
          instructor_id, category_id, title, subtitle, description,
          difficulty, language, price, thumbnail_url, promotional_video_url,
          duration_hours, learning_outcomes, prerequisites, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'DRAFT')
        RETURNING *`,
        [
          req.user.id,
          original.category_id,
          `${original.title} (Copy)`,
          original.subtitle,
          original.description,
          original.difficulty,
          original.language,
          original.price,
          original.thumbnail_url,
          original.promotional_video_url,
          original.duration_hours,
          original.learning_outcomes,
          original.prerequisites
        ]
      );

      const duplicate = duplicateResult.rows[0];

      // Copy tags
      const tagsResult = await client.query(
        'SELECT tag_id FROM course_tag_mapping WHERE course_id = $1',
        [id]
      );

      for (const tag of tagsResult.rows) {
        await client.query(
          'INSERT INTO course_tag_mapping (course_id, tag_id) VALUES ($1, $2)',
          [duplicate.id, tag.tag_id]
        );
      }

      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        data: duplicate
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listCourses,
  getCourse,
  createCourse,
  updateCourse,
  updateCourseStatus,
  deleteCourse,
  duplicateCourse
};