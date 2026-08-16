const { query, getClient } = require('../config/database');

// ============================================================
// GET QUIZZES BY COURSE
// ============================================================
const getQuizzesByCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const result = await query(
      `SELECT q.*,
              c.title AS course_title,
              (
                SELECT COUNT(*)
                FROM questions
                WHERE quiz_id = q.id
              ) AS question_count
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


// ============================================================
// GET SINGLE QUIZ WITH QUESTIONS AND OPTIONS
// ============================================================
const getQuiz = async (req, res, next) => {
  try {
    const { id } = req.params;

    const quizResult = await query(
      `SELECT q.*,
              c.title AS course_title
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

    const questionsResult = await query(
      `SELECT q.*,
              COALESCE(
                (
                  SELECT json_agg(o ORDER BY o.id)
                  FROM question_options o
                  WHERE o.question_id = q.id
                ),
                '[]'::json
              ) AS options
       FROM questions q
       WHERE q.quiz_id = $1
       ORDER BY q.question_order`,
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


// ============================================================
// CREATE QUIZ
// ============================================================
const createQuiz = async (req, res, next) => {
  try {
    const {
      course_id,
      title,
      description,
      passing_percentage,
      time_limit_minutes,
      attempt_limit
    } = req.body;

    if (!course_id || !title) {
      return res.status(400).json({
        success: false,
        error: 'course_id and title are required'
      });
    }

    const result = await query(
      `INSERT INTO quizzes
       (
         course_id,
         title,
         description,
         passing_percentage,
         time_limit_minutes,
         attempt_limit,
         created_at
       )
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
       RETURNING *`,
      [
        course_id,
        title,
        description || null,
        passing_percentage ?? 50,
        time_limit_minutes ?? null,
        attempt_limit ?? null
      ]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};


// ============================================================
// UPDATE QUIZ
// ============================================================
const updateQuiz = async (req, res, next) => {
  try {
    const { id } = req.params;

    const {
      title,
      description,
      passing_percentage,
      time_limit_minutes,
      attempt_limit
    } = req.body;

    const result = await query(
      `UPDATE quizzes
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           passing_percentage = COALESCE($3, passing_percentage),
           time_limit_minutes = COALESCE($4, time_limit_minutes),
           attempt_limit = COALESCE($5, attempt_limit)
       WHERE id = $6
       RETURNING *`,
      [
        title,
        description,
        passing_percentage,
        time_limit_minutes,
        attempt_limit,
        id
      ]
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


// ============================================================
// DELETE QUIZ
// ============================================================
const deleteQuiz = async (req, res, next) => {
  try {
    const { id } = req.params;

    const client = await getClient();

    try {
      await client.query('BEGIN');

      // Delete answers
      await client.query(
        `DELETE FROM quiz_answers
         WHERE quiz_attempt_id IN (
           SELECT id
           FROM quiz_attempts
           WHERE quiz_id = $1
         )`,
        [id]
      );

      // Delete attempts
      await client.query(
        `DELETE FROM quiz_attempts
         WHERE quiz_id = $1`,
        [id]
      );

      // Delete quiz results
      await client.query(
        `DELETE FROM quiz_results
         WHERE quiz_id = $1`,
        [id]
      );

      // Delete question options
      await client.query(
        `DELETE FROM question_options
         WHERE question_id IN (
           SELECT id
           FROM questions
           WHERE quiz_id = $1
         )`,
        [id]
      );

      // Delete questions
      await client.query(
        `DELETE FROM questions
         WHERE quiz_id = $1`,
        [id]
      );

      // Delete quiz
      const result = await client.query(
        `DELETE FROM quizzes
         WHERE id = $1
         RETURNING *`,
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


// ============================================================
// CREATE QUESTION
// ============================================================
const createQuestion = async (req, res, next) => {
  try {
    const {
      quiz_id,
      question_text,
      question_type,
      question_order
    } = req.body;

    if (!quiz_id || !question_text || !question_type) {
      return res.status(400).json({
        success: false,
        error:
          'Missing required fields: quiz_id, question_text, question_type'
      });
    }

    const result = await query(
      `INSERT INTO questions
       (
         quiz_id,
         question_text,
         question_type,
         question_order
       )
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        quiz_id,
        question_text,
        question_type,
        question_order ?? 1
      ]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error creating question:', error);
    next(error);
  }
};


// ============================================================
// UPDATE QUESTION
// ============================================================
const updateQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;

    const {
      question_text,
      question_type,
      question_order
    } = req.body;

    const result = await query(
      `UPDATE questions
       SET question_text = COALESCE($1, question_text),
           question_type = COALESCE($2, question_type),
           question_order = COALESCE($3, question_order)
       WHERE id = $4
       RETURNING *`,
      [
        question_text,
        question_type,
        question_order,
        id
      ]
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


// ============================================================
// DELETE QUESTION
// ============================================================
const deleteQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;

    const client = await getClient();

    try {
      await client.query('BEGIN');

      await client.query(
        `DELETE FROM question_options
         WHERE question_id = $1`,
        [id]
      );

      const result = await client.query(
        `DELETE FROM questions
         WHERE id = $1
         RETURNING *`,
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


// ============================================================
// GET QUESTION OPTIONS
// ============================================================
const getOptionsByQuestion = async (req, res, next) => {
  try {
    const { questionId } = req.params;

    const result = await query(
      `SELECT *
       FROM question_options
       WHERE question_id = $1
       ORDER BY id`,
      [questionId]
    );

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    next(error);
  }
};


// ============================================================
// CREATE QUESTION OPTION
// ============================================================
const createOption = async (req, res, next) => {
  try {
    const {
      question_id,
      option_text,
      is_correct
    } = req.body;

    if (!question_id || !option_text) {
      return res.status(400).json({
        success: false,
        error: 'question_id and option_text are required'
      });
    }

    const result = await query(
      `INSERT INTO question_options
       (
         question_id,
         option_text,
         is_correct
       )
       VALUES ($1, $2, $3)
       RETURNING *`,
      [
        question_id,
        option_text,
        is_correct ?? false
      ]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    next(error);
  }
};


// ============================================================
// UPDATE QUESTION OPTION
// ============================================================
const updateOption = async (req, res, next) => {
  try {
    const { id } = req.params;

    const {
      option_text,
      is_correct
    } = req.body;

    const result = await query(
      `UPDATE question_options
       SET option_text = COALESCE($1, option_text),
           is_correct = COALESCE($2, is_correct)
       WHERE id = $3
       RETURNING *`,
      [
        option_text,
        is_correct,
        id
      ]
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


// ============================================================
// DELETE QUESTION OPTION
// ============================================================
const deleteOption = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `DELETE FROM question_options
       WHERE id = $1
       RETURNING *`,
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


// ============================================================
// START QUIZ ATTEMPT
// ============================================================
const startAttempt = async (req, res, next) => {
  try {
    const { quiz_id } = req.body;
    const student_id = req.user.id;

    if (!quiz_id) {
      return res.status(400).json({
        success: false,
        error: 'quiz_id is required'
      });
    }

    // Get quiz information
    const quizResult = await query(
      `SELECT id, attempt_limit, passing_percentage
       FROM quizzes
       WHERE id = $1`,
      [quiz_id]
    );

    if (quizResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found'
      });
    }

    const quiz = quizResult.rows[0];

    // Check attempt limit
    if (
      quiz.attempt_limit !== null &&
      quiz.attempt_limit !== undefined
    ) {
      const attemptsResult = await query(
        `SELECT COUNT(*) AS count
         FROM quiz_attempts
         WHERE quiz_id = $1
         AND student_id = $2`,
        [quiz_id, student_id]
      );

      const attemptsUsed = parseInt(
        attemptsResult.rows[0].count,
        10
      );

      if (attemptsUsed >= quiz.attempt_limit) {
        return res.status(400).json({
          success: false,
          error: 'Maximum attempt limit reached'
        });
      }
    }

    // Calculate next attempt number
    const attemptNumberResult = await query(
      `SELECT COALESCE(MAX(attempt_number), 0) + 1 AS next_number
       FROM quiz_attempts
       WHERE quiz_id = $1
       AND student_id = $2`,
      [quiz_id, student_id]
    );

    const attemptNumber =
      attemptNumberResult.rows[0].next_number;

    // Create attempt
    const result = await query(
      `INSERT INTO quiz_attempts
       (
         quiz_id,
         student_id,
         attempt_number,
         started_at,
         status
       )
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP, 'IN_PROGRESS')
       RETURNING *`,
      [
        quiz_id,
        student_id,
        attemptNumber
      ]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error starting quiz attempt:', error);
    next(error);
  }
};


// ============================================================
// SUBMIT QUIZ ATTEMPT
// ============================================================
const submitAttempt = async (req, res, next) => {
  try {
    const {
      attempt_id,
      answers
    } = req.body;

    if (!attempt_id) {
      return res.status(400).json({
        success: false,
        error: 'attempt_id is required'
      });
    }

    if (!Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        error: 'answers must be an array'
      });
    }

    const client = await getClient();

    try {
      await client.query('BEGIN');

      // Get attempt + quiz passing percentage
      const attemptResult = await client.query(
        `SELECT qa.*,
                q.passing_percentage
         FROM quiz_attempts qa
         JOIN quizzes q
           ON qa.quiz_id = q.id
         WHERE qa.id = $1`,
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

      // Prevent submitting an already completed attempt
      if (attempt.status === 'COMPLETED') {
        await client.query('ROLLBACK');

        return res.status(400).json({
          success: false,
          error: 'Quiz attempt has already been submitted'
        });
      }

      // Remove existing answers if any
      await client.query(
        `DELETE FROM quiz_answers
         WHERE quiz_attempt_id = $1`,
        [attempt_id]
      );

      let correctCount = 0;

      // Process answers
      for (const answer of answers) {
        if (
          !answer.question_id ||
          !answer.selected_option_id
        ) {
          continue;
        }

        const optionResult = await client.query(
          `SELECT is_correct
           FROM question_options
           WHERE id = $1`,
          [answer.selected_option_id]
        );

        const isCorrect =
          optionResult.rows.length > 0 &&
          optionResult.rows[0].is_correct === true;

        if (isCorrect) {
          correctCount++;
        }

        await client.query(
          `INSERT INTO quiz_answers
           (
             quiz_attempt_id,
             question_id,
             selected_option_id,
             is_correct
           )
           VALUES ($1, $2, $3, $4)`,
          [
            attempt_id,
            answer.question_id,
            answer.selected_option_id,
            isCorrect
          ]
        );
      }

      // Get actual number of questions
      const questionCountResult = await client.query(
        `SELECT COUNT(*) AS count
         FROM questions
         WHERE quiz_id = $1`,
        [attempt.quiz_id]
      );

      const totalQuestions = parseInt(
        questionCountResult.rows[0].count,
        10
      );

      const scorePercentage =
        totalQuestions > 0
          ? (correctCount / totalQuestions) * 100
          : 0;

      const passed =
        scorePercentage >=
        Number(attempt.passing_percentage || 0);

      // Update attempt
      await client.query(
        `UPDATE quiz_attempts
         SET completed_at = CURRENT_TIMESTAMP,
             status = 'COMPLETED',
             score_percentage = $1,
             passed = $2
         WHERE id = $3`,
        [
          scorePercentage,
          passed,
          attempt_id
        ]
      );

      // Check existing quiz result
      const existingResult = await client.query(
        `SELECT *
         FROM quiz_results
         WHERE quiz_id = $1
         AND student_id = $2`,
        [
          attempt.quiz_id,
          attempt.student_id
        ]
      );

      if (existingResult.rows.length > 0) {
        const currentResult =
          existingResult.rows[0];

        const currentBest =
          Number(
            currentResult.best_score_percentage || 0
          );

        if (scorePercentage > currentBest) {
          await client.query(
            `UPDATE quiz_results
             SET best_score_percentage = $1,
                 best_attempt_id = $2,
                 passed = $3,
                 attempts_used = attempts_used + 1,
                 last_attempted_at = CURRENT_TIMESTAMP
             WHERE id = $4`,
            [
              scorePercentage,
              attempt_id,
              passed,
              currentResult.id
            ]
          );
        } else {
          await client.query(
            `UPDATE quiz_results
             SET attempts_used = attempts_used + 1,
                 last_attempted_at = CURRENT_TIMESTAMP
             WHERE id = $1`,
            [currentResult.id]
          );
        }

      } else {
        await client.query(
          `INSERT INTO quiz_results
           (
             quiz_id,
             student_id,
             best_score_percentage,
             best_attempt_id,
             passed,
             attempts_used,
             last_attempted_at
           )
           VALUES ($1, $2, $3, $4, $5, 1, CURRENT_TIMESTAMP)`,
          [
            attempt.quiz_id,
            attempt.student_id,
            scorePercentage,
            attempt_id,
            passed
          ]
        );
      }

      await client.query('COMMIT');

      res.json({
        success: true,
        data: {
          attempt_id,
          score_percentage: scorePercentage,
          correct_answers: correctCount,
          total_questions: totalQuestions,
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
    console.error(
      'Error submitting quiz attempt:',
      error
    );

    next(error);
  }
};


// ============================================================
// GET QUIZ RESULTS FOR STUDENT
// ============================================================
const getQuizResults = async (req, res, next) => {
  try {
    const student_id =
      req.params.studentId || req.user.id;

    const result = await query(
      `SELECT qr.*,
              q.title AS quiz_title,
              c.title AS course_title
       FROM quiz_results qr
       JOIN quizzes q
         ON qr.quiz_id = q.id
       JOIN courses c
         ON q.course_id = c.id
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


// ============================================================
// GET ATTEMPTS FOR QUIZ
// ============================================================
const getQuizAttempts = async (req, res, next) => {
  try {
    const { quizId } = req.params;

    const result = await query(
      `SELECT qa.*,
              u.first_name || ' ' || u.last_name AS student_name,
              u.email AS student_email
       FROM quiz_attempts qa
       JOIN users u
         ON qa.student_id = u.id
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


// ============================================================
// GET QUIZ ANALYTICS
// ============================================================
const getQuizAnalytics = async (req, res, next) => {
  try {
    const { quizId } = req.params;

    // Check quiz exists
    const quizResult = await query(
      `SELECT id, title, passing_percentage
       FROM quizzes
       WHERE id = $1`,
      [quizId]
    );

    if (quizResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found'
      });
    }

    // Total attempts
    const attemptsResult = await query(
      `SELECT
         COUNT(*) AS total_attempts,
         COUNT(*) FILTER (
           WHERE status = 'COMPLETED'
         ) AS completed_attempts,
         COUNT(*) FILTER (
           WHERE passed = true
         ) AS passed_attempts,
         COUNT(*) FILTER (
           WHERE passed = false
         ) AS failed_attempts,
         COALESCE(
           AVG(score_percentage)
           FILTER (WHERE status = 'COMPLETED'),
           0
         ) AS average_score
       FROM quiz_attempts
       WHERE quiz_id = $1`,
      [quizId]
    );

    // Question count
    const questionsResult = await query(
      `SELECT COUNT(*) AS total_questions
       FROM questions
       WHERE quiz_id = $1`,
      [quizId]
    );

    const analytics = {
      quiz: quizResult.rows[0],
      total_questions: parseInt(
        questionsResult.rows[0].total_questions,
        10
      ),
      total_attempts: parseInt(
        attemptsResult.rows[0].total_attempts,
        10
      ),
      completed_attempts: parseInt(
        attemptsResult.rows[0].completed_attempts,
        10
      ),
      passed_attempts: parseInt(
        attemptsResult.rows[0].passed_attempts,
        10
      ),
      failed_attempts: parseInt(
        attemptsResult.rows[0].failed_attempts,
        10
      ),
      average_score: Number(
        attemptsResult.rows[0].average_score || 0
      )
    };

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error(
      'Error getting quiz analytics:',
      error
    );

    next(error);
  }
};


// ============================================================
// EXPORTS
// ============================================================
module.exports = {
  getQuizzesByCourse,
  getQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,

  createQuestion,
  updateQuestion,
  deleteQuestion,

  getOptionsByQuestion,
  createOption,
  updateOption,
  deleteOption,

  startAttempt,
  submitAttempt,

  getQuizResults,
  getQuizAttempts,
  getQuizAnalytics
};
