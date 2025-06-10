const express = require('express');
const {
  register,
  login,
  getMe,
  updateDetails,
  updatePassword,
  registerValidation,
  loginValidation,
  updateDetailsValidation,
  updatePasswordValidation
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetailsValidation, updateDetails);
router.put('/updatepassword', protect, updatePasswordValidation, updatePassword);

module.exports = router;