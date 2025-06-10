const express = require('express');
const {
  getAllUsers,
  getUserDetails,
  updateUser,
  deleteUser,
  getPlatformStats,
  getAllFiles,
  deleteFile,
  getDataUsageAnalytics
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// User management routes
router.get('/users', getAllUsers);
router.get('/users/:id', getUserDetails);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// File management routes
router.get('/files', getAllFiles);
router.delete('/files/:id', deleteFile);

// Analytics and statistics routes
router.get('/stats', getPlatformStats);
router.get('/analytics', getDataUsageAnalytics);

module.exports = router;