const express = require('express');
const { body } = require('express-validator');
const certificateController = require('../controllers/certificateController');
const { protect, authorize } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Validation rules
const issueCertificateValidation = [
  body('course_id').notEmpty().withMessage('Course ID is required')
];

// Certificate routes
router.get('/student/:studentId', protect, certificateController.getStudentCertificates);
router.get('/my-certificates', protect, certificateController.getStudentCertificates);
router.get('/:id', protect, certificateController.getCertificate);
router.get('/course/:courseId/eligibility', protect, certificateController.getCertificateEligibility);
router.post('/issue', protect, issueCertificateValidation, handleValidationErrors, certificateController.issueCertificate);
router.get('/verify/:certificateNumber', certificateController.verifyCertificate);
router.put('/:id/revoke', protect, authorize('ADMIN'), certificateController.revokeCertificate);
router.get('/course/:courseId/issued', protect, authorize('INSTRUCTOR', 'ADMIN'), certificateController.getCourseCertificates);

module.exports = router;