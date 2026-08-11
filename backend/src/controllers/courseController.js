const { query, getClient } = require('../config/database');

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
  // Note: 'all' or undefined means no price filter

  if (filters.search) {
    conditions.push(`(c.title ILIKE $${paramIndex++} OR c.subtitle ILIKE $${paramIndex++} OR c.description ILIKE $${paramIndex++})`);
    const searchTerm = `%${filters.search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  return { conditions, params };
};

const VALID_PRICE_TYPES = ['all', 'free', 'paid'];
const VALID_SORT_BY = ['newest', 'popularity', 'title', 'price_asc', 'price_desc'];

// Get all courses with filters
const listCourses = async (req, res, next) => {
  try {
    const rawPriceType = req.query.priceType;
    const rawSortBy = req.query.sortBy;

    const priceType = rawPriceType && VALID_PRICE_TYPES.includes(String(rawPriceType))
      ? String(rawPriceType)
      : 'all';

    const sortBy = rawSortBy && VALID_SORT_BY.includes(String(rawSortBy))
      ? String(rawSortBy)
      : 'newest';

    const filters = {
      instructorId: req.query.instructorId || undefined,
      status: req.query.status || undefined,
      categoryId: req.query.categoryId || undefined,
      language: req.query.language || undefined,
      priceType: priceType === 'all' ? undefined : priceType,
      search: req.query.search || undefined,
    };

    const { conditions, params } = buildCourseFilters(filters);
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    let orderClause = 'ORDER BY c.created_at DESC';
    if (sortBy === 'popularity') {
      orderClause = 'ORDER BY enrollment_count DESC, c.created_at DESC';
    } else if (sortBy === 'title') {
      orderClause = 'ORDER BY c.title ASC';
    } else if (sortBy === 'price_asc') {
      orderClause = 'ORDER BY c.price ASC, c.created_at DESC';
    } else if (sortBy === 'price_desc') {
      orderClause = 'ORDER BY c.price DESC, c.created_at DESC';
    }

    const queryText = `
      SELECT c.id, c.instructor_id, c.category_id, c.title, c.subtitle, c.description,
        c.difficulty, c.language, c.thumbnail_url, c.promotional_video_url, c.price,
        c.duration_hours, c.learning_outcomes, c.prerequisites, c.status,
        c.created_at, c.updated_at,
        ip.full_name as instructor_name,
        cat.category_name,
        COALESCE(enr.enrollment_count, 0) as enrollment_count,
        COALESCE(rev.average_rating, 0) as average_rating,
        COALESCE(rev.review_count, 0) as review_count
      FROM courses c
      LEFT JOIN instructor_profiles ip ON c.instructor_id = ip.user_id
      LEFT JOIN course_categories cat ON c.category_id = cat.id
      LEFT JOIN (
        SELECT course_id, COUNT(*)::int as enrollment_count
        FROM enrollments
        GROUP BY course_id
      ) enr ON c.id = enr.course_id
      LEFT JOIN (
        SELECT course_id,
          ROUND(AVG(rating)::numeric, 1) as average_rating,
          COUNT(*)::int as review_count
        FROM course_reviews
        GROUP BY course_id
      ) rev ON c.id = rev.course_id
      ${whereClause}
      ${orderClause}
    `;

    const result = await query(queryText, params);

    const coursesWithTags = result.rows.map(course => ({
      ...course,
      duration_minutes: course.duration_hours ? course.duration_hours * 60 : 0,
      tags: [],
    }));

    return res.json({
      success: true,
      data: coursesWithTags,
    });
  } catch (error) {
    console.error('listCourses error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch courses',
    });
  }
};

// Get single course by ID
const getCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    const courseResult = await query(
      `SELECT c.id, c.instructor_id, c.category_id, c.title, c.subtitle, c.description,
        c.difficulty, c.language, c.thumbnail_url, c.promotional_video_url, c.price,
        c.duration_hours, c.learning_outcomes, c.prerequisites, c.status,
        c.created_at, c.updated_at,
        ip.full_name as instructor_name,
        cat.category_name
      FROM courses c
      LEFT JOIN instructor_profiles ip ON c.instructor_id = ip.user_id
      LEFT JOIN course_categories cat ON c.category_id = cat.id
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

    const course = {
      ...courseResult.rows[0],
      duration_minutes: courseResult.rows[0].duration_hours ? courseResult.rows[0].duration_hours * 60 : 0,
      enrollment_count: 0,
      average_rating: 0,
      review_count: 0,
      tags: tagsResult.rows
    };

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
      duration_minutes,
      learning_outcomes,
      prerequisites,
      status,
      tags
    } = req.body;

    const client = await getClient();

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
          duration_minutes ? Math.floor(duration_minutes / 60) : null,
          learning_outcomes ? JSON.stringify(learning_outcomes) : null,
          prerequisites ? JSON.stringify(prerequisites) : null,
          status || 'DRAFT'
        ]
      );

      const course = courseResult.rows[0];

      // Add tags if provided
      if (tags && tags.length > 0) {
        for (const tag of tags) {
          const tagId = typeof tag === 'object' ? tag.id : tag;
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

    const client = await getClient();
    
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

    const client = await getClient();
    
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
          original.duration_hours || null,
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