const express = require('express');
const { body } = require('express-validator');
const certificateController = require('../controllers/certificateController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Validation rules
const issueCertificateValidation = [
  body('course_id').notEmpty().withMessage('Course ID is required'),
];

// Certificate routes — specific paths before /:id
router.get('/my', protect, certificateController.getStudentCertificates);
router.get('/my-certificates', protect, certificateController.getStudentCertificates);
router.get('/student/:studentId', protect, certificateController.getStudentCertificates);
router.get('/course/:courseId/my', protect, certificateController.getMyCourseCertificate);
router.get('/course/:courseId/eligibility', protect, certificateController.getCertificateEligibility);
router.get('/course/:courseId/issued', protect, authorize('INSTRUCTOR', 'ADMIN'), certificateController.getCourseCertificates);
router.get('/verify/:certificateNumber', certificateController.verifyCertificate);
router.post('/issue', protect, issueCertificateValidation, handleValidationErrors, certificateController.issueCertificate);
router.put('/:id/revoke', protect, authorize('ADMIN'), certificateController.revokeCertificate);
router.get('/:id', protect, certificateController.getCertificate);

module.exports = router;
