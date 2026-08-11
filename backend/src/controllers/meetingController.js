const { query, getClient } = require('../config/database');

// Get meetings by course
const getMeetingsByCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const result = await query(
      `SELECT m.*,
        c.title as course_title
      FROM meetings m
      JOIN courses c ON m.course_id = c.id
      WHERE m.course_id = $1
      ORDER BY m.meeting_date ASC, m.start_time ASC`,
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

// Get single meeting
const getMeeting = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT m.*,
        c.title as course_title
      FROM meetings m
      JOIN courses c ON m.course_id = c.id
      WHERE m.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Meeting not found'
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

// Create new meeting
const createMeeting = async (req, res, next) => {
  try {
    const { course_id, title, description, meeting_date, start_time, end_time, google_meet_link } = req.body;
    const instructor_id = req.user.id;

    const result = await query(
      `INSERT INTO meetings (course_id, instructor_id, title, description, meeting_date, start_time, end_time, google_meet_link, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'SCHEDULED', CURRENT_TIMESTAMP)
       RETURNING *`,
      [course_id, instructor_id, title, description, meeting_date, start_time, end_time, google_meet_link]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Update meeting
const updateMeeting = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, meeting_date, start_time, end_time, google_meet_link, recording_url, notes, status } = req.body;

    const result = await query(
      `UPDATE meetings
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           meeting_date = COALESCE($3, meeting_date),
           start_time = COALESCE($4, start_time),
           end_time = COALESCE($5, end_time),
           google_meet_link = COALESCE($6, google_meet_link),
           recording_url = COALESCE($7, recording_url),
           notes = COALESCE($8, notes),
           status = COALESCE($9, status)
       WHERE id = $10
       RETURNING *`,
      [title, description, meeting_date, start_time, end_time, google_meet_link, recording_url, notes, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Meeting not found'
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

// Delete meeting
const deleteMeeting = async (req, res, next) => {
  try {
    const { id } = req.params;

    const client = await getClient();
    
    try {
      await client.query('BEGIN');

      // Delete attendance records
      await client.query(
        'DELETE FROM meeting_attendance WHERE meeting_id = $1',
        [id]
      );

      // Delete meeting
      const result = await client.query(
        'DELETE FROM meetings WHERE id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          error: 'Meeting not found'
        });
      }

      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'Meeting deleted successfully'
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

// Get attendance for a meeting
const getAttendance = async (req, res, next) => {
  try {
    const { meetingId } = req.params;

    const result = await query(
      `SELECT ma.*,
        sp.full_name as student_name,
        u.email as student_email
      FROM meeting_attendance ma
      JOIN users u ON ma.student_id = u.id
      JOIN student_profiles sp ON ma.student_id = sp.user_id
      WHERE ma.meeting_id = $1
      ORDER BY ma.joined_at ASC`,
      [meetingId]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

// Join meeting (record attendance)
const joinMeeting = async (req, res, next) => {
  try {
    const { meetingId } = req.params;
    const student_id = req.user.id;

    // Check if already joined
    const existingAttendance = await query(
      'SELECT id FROM meeting_attendance WHERE meeting_id = $1 AND student_id = $2',
      [meetingId, student_id]
    );

    if (existingAttendance.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Already joined this meeting'
      });
    }

    const result = await query(
      `INSERT INTO meeting_attendance (meeting_id, student_id, joined_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       RETURNING *`,
      [meetingId, student_id]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Leave meeting (update attendance)
const leaveMeeting = async (req, res, next) => {
  try {
    const { meetingId } = req.params;
    const student_id = req.user.id;

    const result = await query(
      `UPDATE meeting_attendance
       SET left_at = CURRENT_TIMESTAMP,
           duration_minutes = EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - joined_at))/60
       WHERE meeting_id = $1 AND student_id = $2
       RETURNING *`,
      [meetingId, student_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Attendance record not found'
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

// Get student attendance
const getStudentAttendance = async (req, res, next) => {
  try {
    const student_id = req.params.studentId || req.user.id;

    const result = await query(
      `SELECT ma.*,
        m.title as meeting_title,
        m.meeting_date,
        m.start_time,
        m.end_time,
        c.title as course_title
      FROM meeting_attendance ma
      JOIN meetings m ON ma.meeting_id = m.id
      JOIN courses c ON m.course_id = c.id
      WHERE ma.student_id = $1
      ORDER BY ma.joined_at DESC`,
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

module.exports = {
  getMeetingsByCourse,
  getMeeting,
  createMeeting,
  updateMeeting,
  deleteMeeting,
  getAttendance,
  joinMeeting,
  leaveMeeting,
  getStudentAttendance
};