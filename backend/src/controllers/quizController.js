const { query } = require('../config/database');

// Get quizzes by course
const getQuizzesByCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const result = await query(
      `SELECT q.*,
        c.title as course_title,
        (SELECT COUNT(*) FROM questions WHERE quiz_id = q.id) as question_count
      FROM quizzes q
      JOIN courses c ON q.course_id = c.id
      WHERE q.course_id = $1
      ORDER BY q.created_at DESC`,
      [courseId]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

// Get single quiz with questions
const getQuiz = async (req, res, next) => {
  try {
    const { id } = req.params;

    const quizResult = await query(
      `SELECT q.*,
        c.title as course_title
      FROM quizzes q
      JOIN courses c ON q.course_id = c.id
      WHERE q.id = $1`,
      [id]
    );

    if (quizResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found'
      });
    }

    // Get questions with options
    const questionsResult = await query(
      `SELECT q.*,
        (SELECT json_agg(o ORDER BY o.display_order)
         FROM question_options o
         WHERE o.question_id = q.id) as options
      FROM questions q
      WHERE q.quiz_id = $1
      ORDER BY q.display_order`,
      [id]
    );

    const quiz = {
      ...quizResult.rows[0],
      questions: questionsResult.rows
    };

    res.json({
      success: true,
      data: quiz
    });
  } catch (error) {
    next(error);
  }
};

// Create new quiz
const createQuiz = async (req, res, next) => {
  try {
    const { course_id, title, description, passing_percentage, timer_minutes, attempt_limit } = req.body;

    const result = await query(
      `INSERT INTO quizzes (course_id, title, description, passing_percentage, timer_minutes, attempt_limit, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
       RETURNING *`,
      [course_id, title, description, passing_percentage, timer_minutes, attempt_limit]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Update quiz
const updateQuiz = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, passing_percentage, timer_minutes, attempt_limit } = req.body;

    const result = await query(
      `UPDATE quizzes
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           passing_percentage = COALESCE($3, passing_percentage),
           timer_minutes = COALESCE($4, timer_minutes),
           attempt_limit = COALESCE($5, attempt_limit)
       WHERE id = $6
       RETURNING *`,
      [title, description, passing_percentage, timer_minutes, attempt_limit, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found'
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

// Delete quiz
const deleteQuiz = async (req, res, next) => {
  try {
    const { id } = req.params;

    const client = await query('getClient');
    
    try {
      await client.query('BEGIN');

      // Delete answers
      await client.query(
        `DELETE FROM quiz_answers 
         WHERE quiz_attempt_id IN (
           SELECT id FROM quiz_attempts WHERE quiz_id = $1
         )`,
        [id]
      );

      // Delete attempts
      await client.query(
        'DELETE FROM quiz_attempts WHERE quiz_id = $1',
        [id]
      );

      // Delete quiz results
      await client.query(
        'DELETE FROM quiz_results WHERE quiz_id = $1',
        [id]
      );

      // Delete question options
      await client.query(
        `DELETE FROM question_options 
         WHERE question_id IN (
           SELECT id FROM questions WHERE quiz_id = $1
         )`,
        [id]
      );

      // Delete questions
      await client.query(
        'DELETE FROM questions WHERE quiz_id = $1',
        [id]
      );

      // Delete quiz
      const result = await client.query(
        'DELETE FROM quizzes WHERE id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          error: 'Quiz not found'
        });
      }

      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'Quiz deleted successfully'
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

// Create question
const createQuestion = async (req, res, next) => {
  try {
    const { quiz_id, question_text, question_type, display_order } = req.body;

    const result = await query(
      `INSERT INTO questions (quiz_id, question_text, question_type, display_order, created_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       RETURNING *`,
      [quiz_id, question_text, question_type, display_order]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Update question
const updateQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { question_text, question_type, display_order } = req.body;

    const result = await query(
      `UPDATE questions
       SET question_text = COALESCE($1, question_text),
           question_type = COALESCE($2, question_type),
           display_order = COALESCE($3, display_order)
       WHERE id = $4
       RETURNING *`,
      [question_text, question_type, display_order, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Question not found'
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

// Delete question
const deleteQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;

    const client = await query('getClient');
    
    try {
      await client.query('BEGIN');

      // Delete options
      await client.query(
        'DELETE FROM question_options WHERE question_id = $1',
        [id]
      );

      // Delete question
      const result = await client.query(
        'DELETE FROM questions WHERE id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          error: 'Question not found'
        });
      }

      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'Question deleted successfully'
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

// Create question option
const createOption = async (req, res, next) => {
  try {
    const { question_id, option_text, is_correct, display_order } = req.body;

    const result = await query(
      `INSERT INTO question_options (question_id, option_text, is_correct, display_order)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [question_id, option_text, is_correct, display_order]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Update question option
const updateOption = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { option_text, is_correct, display_order } = req.body;

    const result = await query(
      `UPDATE question_options
       SET option_text = COALESCE($1, option_text),
           is_correct = COALESCE($2, is_correct),
           display_order = COALESCE($3, display_order)
       WHERE id = $4
       RETURNING *`,
      [option_text, is_correct, display_order, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Option not found'
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

// Delete question option
const deleteOption = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM question_options WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Option not found'
      });
    }

    res.json({
      success: true,
      message: 'Option deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Start quiz attempt
const startAttempt = async (req, res, next) => {
  try {
    const { quiz_id } = req.body;
    const student_id = req.user.id;

    // Check attempt limit
    const quizResult = await query(
      'SELECT attempt_limit FROM quizzes WHERE id = $1',
      [quiz_id]
    );

    if (quizResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found'
      });
    }

    const quiz = quizResult.rows[0];

    if (quiz.attempt_limit) {
      const attemptsResult = await query(
        'SELECT COUNT(*) as count FROM quiz_attempts WHERE quiz_id = $1 AND student_id = $2',
        [quiz_id, student_id]
      );

      if (parseInt(attemptsResult.rows[0].count) >= quiz.attempt_limit) {
        return res.status(400).json({
          success: false,
          error: 'Maximum attempt limit reached'
        });
      }
    }

    // Get next attempt number
    const attemptNumberResult = await query(
      'SELECT COALESCE(MAX(attempt_number), 0) + 1 as next_number FROM quiz_attempts WHERE quiz_id = $1 AND student_id = $2',
      [quiz_id, student_id]
    );

    const result = await query(
      `INSERT INTO quiz_attempts (quiz_id, student_id, attempt_number, started_at, status)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP, 'IN_PROGRESS')
       RETURNING *`,
      [quiz_id, student_id, attemptNumberResult.rows[0].next_number]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Submit quiz attempt
const submitAttempt = async (req, res, next) => {
  try {
    const { attempt_id, answers } = req.body; // answers: [{ question_id, selected_option_id }]

    const client = await query('getClient');
    
    try {
      await client.query('BEGIN');

      // Get attempt
      const attemptResult = await client.query(
        'SELECT * FROM quiz_attempts WHERE id = $1',
        [attempt_id]
      );

      if (attemptResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          error: 'Quiz attempt not found'
        });
      }

      const attempt = attemptResult.rows[0];

      // Update attempt status
      await client.query(
        `UPDATE quiz_attempts
         SET completed_at = CURRENT_TIMESTAMP, status = 'COMPLETED'
         WHERE id = $1`,
        [attempt_id]
      );

      // Process answers
      let correctCount = 0;
      for (const answer of answers) {
        // Get correct option
        const optionResult = await client.query(
          'SELECT is_correct FROM question_options WHERE id = $1',
          [answer.selected_option_id]
        );

        const isCorrect = optionResult.rows.length > 0 && optionResult.rows[0].is_correct;
        if (isCorrect) correctCount++;

        // Save answer
        await client.query(
          `INSERT INTO quiz_answers (quiz_attempt_id, question_id, selected_option_id, is_correct)
           VALUES ($1, $2, $3, $4)`,
          [attempt_id, answer.question_id, answer.selected_option_id, isCorrect]
        );
      }

      // Calculate score
      const totalQuestions = answers.length;
      const scorePercentage = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
      const passed = scorePercentage >= attempt.passing_percentage;

      // Update attempt with score
      await client.query(
        `UPDATE quiz_attempts
         SET score_percentage = $1, passed = $2
         WHERE id = $3`,
        [scorePercentage, passed, attempt_id]
      );

      // Update or create quiz result
      const existingResult = await client.query(
        'SELECT * FROM quiz_results WHERE quiz_id = $1 AND student_id = $2',
        [attempt.quiz_id, attempt.student_id]
      );

      if (existingResult.rows.length > 0) {
        // Update if this is better
        const currentBest = existingResult.rows[0];
        if (scorePercentage > currentBest.best_score_percentage) {
          await client.query(
            `UPDATE quiz_results
             SET best_score_percentage = $1, best_attempt_id = $2, passed = $3, attempts_used = attempts_used + 1, last_attempted_at = CURRENT_TIMESTAMP
             WHERE id = $4`,
            [scorePercentage, attempt_id, passed, currentResult.rows[0].id]
          );
        } else {
          await client.query(
            `UPDATE quiz_results
             SET attempts_used = attempts_used + 1, last_attempted_at = CURRENT_TIMESTAMP
             WHERE id = $1`,
            [currentResult.rows[0].id]
          );
        }
      } else {
        // Create new result
        await client.query(
          `INSERT INTO quiz_results (quiz_id, student_id, best_score_percentage, best_attempt_id, passed, attempts_used, last_attempted_at)
           VALUES ($1, $2, $3, $4, $5, 1, CURRENT_TIMESTAMP)`,
          [attempt.quiz_id, attempt.student_id, scorePercentage, attempt_id, passed]
        );
      }

      await client.query('COMMIT');

      res.json({
        success: true,
        data: {
          attempt_id,
          score_percentage: scorePercentage,
          passed
        }
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

// Get quiz results for student
const getQuizResults = async (req, res, next) => {
  try {
    const student_id = req.params.studentId || req.user.id;

    const result = await query(
      `SELECT qr.*,
        q.title as quiz_title,
        c.title as course_title
      FROM quiz_results qr
      JOIN quizzes q ON qr.quiz_id = q.id
      JOIN courses c ON q.course_id = c.id
      WHERE qr.student_id = $1
      ORDER BY qr.last_attempted_at DESC`,
      [student_id]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

// Get attempts for a quiz
const getQuizAttempts = async (req, res, next) => {
  try {
    const { quizId } = req.params;

    const result = await query(
      `SELECT qa.*,
        u.first_name || ' ' || u.last_name as student_name,
        u.email as student_email
      FROM quiz_attempts qa
      JOIN users u ON qa.student_id = u.id
      WHERE qa.quiz_id = $1
      ORDER BY qa.started_at DESC`,
      [quizId]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getQuizzesByCourse,
  getQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  createOption,
  updateOption,
  deleteOption,
  startAttempt,
  submitAttempt,
  getQuizResults,
  getQuizAttempts
};