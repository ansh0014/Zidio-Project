const express = require('express');
const {
  upload,
  uploadFile,
  getFiles,
  getFile,
  getFileData,
  deleteFile,
  regenerateInsights,
  getUserStats
} = require('../controllers/fileController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// File routes
router.get('/stats', getUserStats);
router.get('/', getFiles);
router.post('/upload', upload.single('file'), uploadFile);
router.get('/:id', getFile);
router.get('/:id/data', getFileData);
router.delete('/:id', deleteFile);
router.post('/:id/insights', regenerateInsights);

module.exports = router;