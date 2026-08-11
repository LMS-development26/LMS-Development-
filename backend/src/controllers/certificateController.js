const { query } = require('../config/database');

// Get certificates for a student
const getStudentCertificates = async (req, res, next) => {
  try {
    const student_id = req.params.studentId || req.user.id;

    const result = await query(
      `SELECT cert.*,
        c.title as course_title,
        c.thumbnail_url,
        ip.full_name as instructor_name
      FROM certificates cert
      JOIN courses c ON cert.course_id = c.id
      JOIN instructor_profiles ip ON c.instructor_id = ip.user_id
      WHERE cert.student_id = $1
      ORDER BY cert.issued_at DESC`,
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

// Get single certificate
const getCertificate = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT cert.*,
        c.title as course_title,
        c.description as course_description,
        sp.full_name as student_name,
        u.email as student_email,
        ip.full_name as instructor_name
      FROM certificates cert
      JOIN courses c ON cert.course_id = c.id
      JOIN users u ON cert.student_id = u.id
      JOIN student_profiles sp ON cert.student_id = sp.user_id
      JOIN instructor_profiles ip ON c.instructor_id = ip.user_id
      WHERE cert.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Certificate not found'
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

// Get certificate eligibility for a course
const getCertificateEligibility = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const student_id = req.query.studentId || req.user.id;

    // Check if student is enrolled
    const enrollment = await query(
      'SELECT id FROM enrollments WHERE course_id = $1 AND student_id = $2',
      [courseId, student_id]
    );

    if (enrollment.rows.length === 0) {
      return res.json({
        success: true,
        data: {
          eligible: false,
          status: 'NOT_ENROLLED',
          message: 'Student is not enrolled in this course'
        }
      });
    }

    // Check course progress
    const progress = await query(
      'SELECT * FROM course_progress WHERE course_id = $1 AND student_id = $2',
      [courseId, student_id]
    );

    if (progress.rows.length === 0) {
      return res.json({
        success: true,
        data: {
          eligible: false,
          status: 'NOT_STARTED',
          message: 'Course progress not found'
        }
      });
    }

    const courseProgress = progress.rows[0];

    // Check if certificate already exists
    const existingCertificate = await query(
      'SELECT id FROM certificates WHERE course_id = $1 AND student_id = $2',
      [courseId, student_id]
    );

    if (existingCertificate.rows.length > 0) {
      return res.json({
        success: true,
        data: {
          eligible: false,
          status: 'ALREADY_ISSUED',
          message: 'Certificate already issued',
          certificate_id: existingCertificate.rows[0].id
        }
      });
    }

    // Check eligibility (100% completion)
    const isEligible = courseProgress.progress_percentage >= 100 && courseProgress.completed_at !== null;

    res.json({
      success: true,
      data: {
        eligible: isEligible,
        status: isEligible ? 'ELIGIBLE' : 'IN_PROGRESS',
        progress_percentage: courseProgress.progress_percentage,
        completed_at: courseProgress.completed_at,
        message: isEligible ? 'Student is eligible for certificate' : 'Course not completed yet'
      }
    });
  } catch (error) {
    next(error);
  }
};

// Issue certificate
const issueCertificate = async (req, res, next) => {
  try {
    const { course_id } = req.body;
    const student_id = req.user.id;

    // Check eligibility
    const eligibility = await query(
      'SELECT * FROM course_progress WHERE course_id = $1 AND student_id = $2',
      [course_id, student_id]
    );

    if (eligibility.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Course progress not found'
      });
    }

    const progress = eligibility.rows[0];

    if (progress.progress_percentage < 100 || progress.completed_at === null) {
      return res.status(400).json({
        success: false,
        error: 'Course must be completed to issue certificate'
      });
    }

    // Check if certificate already exists
    const existingCertificate = await query(
      'SELECT id FROM certificates WHERE course_id = $1 AND student_id = $2',
      [course_id, student_id]
    );

    if (existingCertificate.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Certificate already issued'
      });
    }

    // Generate certificate number
    const certificateNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const result = await query(
      `INSERT INTO certificates (course_id, student_id, certificate_number, issued_at, status)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP, 'ISSUED')
       RETURNING *`,
      [course_id, student_id, certificateNumber]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Verify certificate
const verifyCertificate = async (req, res, next) => {
  try {
    const { certificateNumber } = req.params;

    const result = await query(
      `SELECT cert.*,
        c.title as course_title,
        sp.full_name as student_name,
        ip.full_name as instructor_name
      FROM certificates cert
      JOIN courses c ON cert.course_id = c.id
      JOIN student_profiles sp ON cert.student_id = sp.user_id
      JOIN instructor_profiles ip ON c.instructor_id = ip.user_id
      WHERE cert.certificate_number = $1`,
      [certificateNumber]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Certificate not found'
      });
    }

    const certificate = result.rows[0];

    res.json({
      success: true,
      data: {
        valid: certificate.status === 'ISSUED',
        certificate
      }
    });
  } catch (error) {
    next(error);
  }
};

// Revoke certificate (admin only)
const revokeCertificate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const result = await query(
      `UPDATE certificates
       SET status = 'REVOKED',
           revoked_at = CURRENT_TIMESTAMP,
           revocation_reason = $1
       WHERE id = $2
       RETURNING *`,
      [reason, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Certificate not found'
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

// Get certificates for a course (instructor view)
const getCourseCertificates = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const result = await query(
      `SELECT cert.*,
        sp.full_name as student_name,
        u.email as student_email
      FROM certificates cert
      JOIN users u ON cert.student_id = u.id
      JOIN student_profiles sp ON cert.student_id = sp.user_id
      WHERE cert.course_id = $1
      ORDER BY cert.issued_at DESC`,
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

// Get certificate for logged-in student in a specific course
const getMyCourseCertificate = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const student_id = req.user.id;

    const result = await query(
      `SELECT cert.*,
        c.title as course_title,
        c.thumbnail_url,
        sp.full_name as student_name,
        ip.full_name as instructor_name
      FROM certificates cert
      JOIN courses c ON cert.course_id = c.id
      JOIN student_profiles sp ON cert.student_id = sp.user_id
      JOIN instructor_profiles ip ON c.instructor_id = ip.user_id
      WHERE cert.course_id = $1 AND cert.student_id = $2 AND cert.status = 'ISSUED'
      ORDER BY cert.issued_at DESC
      LIMIT 1`,
      [courseId, student_id]
    );

    return res.json({
      success: true,
      data: result.rows[0] || null,
    });
  } catch (error) {
    console.error('getMyCourseCertificate error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch certificate',
    });
  }
};

module.exports = {
  getStudentCertificates,
  getCertificate,
  getCertificateEligibility,
  getMyCourseCertificate,
  issueCertificate,
  verifyCertificate,
  revokeCertificate,
  getCourseCertificates,
};