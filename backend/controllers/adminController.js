const User = require('../models/User');
const File = require('../models/File');
const mongoose = require('mongoose');

// @desc    Get all users with pagination
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Build search query
    let searchQuery = {};
    if (search) {
      searchQuery = {
        $or: [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }

    // Get users with file counts
    const usersAggregation = await User.aggregate([
      { $match: searchQuery },
      {
        $lookup: {
          from: 'files',
          localField: '_id',
          foreignField: 'userId',
          as: 'files'
        }
      },
      {
        $addFields: {
          fileCount: { $size: '$files' },
          totalFileSize: {
            $sum: '$files.size'
          },
          processedFiles: {
            $size: {
              $filter: {
                input: '$files',
                cond: { $eq: ['$$this.status', 'processed'] }
              }
            }
          }
        }
      },
      {
        $project: {
          password: 0,
          files: 0
        }
      },
      { $sort: { [sortBy]: sortOrder } },
      { $skip: skip },
      { $limit: limit }
    ]);

    const total = await User.countDocuments(searchQuery);

    res.status(200).json({
      success: true,
      count: usersAggregation.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: {
        users: usersAggregation
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving users'
    });
  }
};

// @desc    Get user details with files
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const files = await File.find({ userId: req.params.id })
      .select('-parsedData')
      .sort({ createdAt: -1 });

    const userStats = await File.getUserStats(req.params.id);

    res.status(200).json({
      success: true,
      data: {
        user,
        files,
        statistics: userStats
      }
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving user details'
    });
  }
};

// @desc    Update user role or status
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const { role, isActive } = req.body;
    const allowedUpdates = {};

    if (role && ['user', 'admin'].includes(role)) {
      allowedUpdates.role = role;
    }

    if (typeof isActive === 'boolean') {
      allowedUpdates.isActive = isActive;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      allowedUpdates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user'
    });
  }
};

// @desc    Delete user and their files
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Delete user's files
    await File.deleteMany({ userId: req.params.id });
    
    // Delete user
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User and associated files deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user'
    });
  }
};

// @desc    Get platform statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getPlatformStats = async (req, res) => {
  try {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get comprehensive platform statistics
    const stats = await Promise.all([
      // Total users
      User.countDocuments(),
      
      // Active users (logged in within last 30 days)
      User.countDocuments({ lastLogin: { $gte: lastMonth } }),
      
      // New users this month
      User.countDocuments({ createdAt: { $gte: lastMonth } }),
      
      // Total files
      File.countDocuments(),
      
      // Files uploaded this week
      File.countDocuments({ createdAt: { $gte: lastWeek } }),
      
      // Processed files
      File.countDocuments({ status: 'processed' }),
      
      // Failed files
      File.countDocuments({ status: 'error' }),
      
      // Total storage used
      File.aggregate([
        { $group: { _id: null, totalSize: { $sum: '$size' } } }
      ]),
      
      // Files with AI insights
      File.countDocuments({ 'insights.aiGenerated': true }),
      
      // User roles distribution
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]),
      
      // File upload trends (last 7 days)
      File.aggregate([
        {
          $match: {
            createdAt: { $gte: lastWeek }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt'
              }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      
      // Top file types
      File.aggregate([
        {
          $group: {
            _id: '$mimetype',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]),
      
      // Average file size
      File.aggregate([
        {
          $group: {
            _id: null,
            avgSize: { $avg: '$size' },
            maxSize: { $max: '$size' },
            minSize: { $min: '$size' }
          }
        }
      ])
    ]);

    const [
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      totalFiles,
      filesThisWeek,
      processedFiles,
      failedFiles,
      storageStats,
      aiInsightFiles,
      userRoles,
      uploadTrends,
      fileTypes,
      fileSizeStats
    ] = stats;

    const totalStorage = storageStats[0]?.totalSize || 0;
    const avgFileSize = fileSizeStats[0]?.avgSize || 0;
    const maxFileSize = fileSizeStats[0]?.maxSize || 0;
    const minFileSize = fileSizeStats[0]?.minSize || 0;

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          newThisMonth: newUsersThisMonth,
          roles: userRoles
        },
        files: {
          total: totalFiles,
          thisWeek: filesThisWeek,
          processed: processedFiles,
          failed: failedFiles,
          withAiInsights: aiInsightFiles,
          processingRate: totalFiles > 0 ? ((processedFiles / totalFiles) * 100).toFixed(2) : 0
        },
        storage: {
          total: totalStorage,
          average: avgFileSize,
          maximum: maxFileSize,
          minimum: minFileSize,
          formatted: {
            total: formatBytes(totalStorage),
            average: formatBytes(avgFileSize),
            maximum: formatBytes(maxFileSize),
            minimum: formatBytes(minFileSize)
          }
        },
        trends: {
          uploads: uploadTrends,
          fileTypes: fileTypes
        },
        performance: {
          successRate: totalFiles > 0 ? ((processedFiles / totalFiles) * 100).toFixed(2) : 0,
          failureRate: totalFiles > 0 ? ((failedFiles / totalFiles) * 100).toFixed(2) : 0,
          aiUtilization: totalFiles > 0 ? ((aiInsightFiles / totalFiles) * 100).toFixed(2) : 0
        }
      }
    });
  } catch (error) {
    console.error('Get platform stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving platform statistics'
    });
  }
};

// @desc    Get all files with admin view
// @route   GET /api/admin/files
// @access  Private/Admin
const getAllFiles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const userId = req.query.userId;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Build filter query
    let filterQuery = {};
    if (status) {
      filterQuery.status = status;
    }
    if (userId) {
      filterQuery.userId = mongoose.Types.ObjectId(userId);
    }

    const files = await File.find(filterQuery)
      .populate('userId', 'username email')
      .select('-parsedData') // Exclude large data from list view
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    const total = await File.countDocuments(filterQuery);

    res.status(200).json({
      success: true,
      count: files.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: {
        files
      }
    });
  } catch (error) {
    console.error('Get all files error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving files'
    });
  }
};

// @desc    Delete any file (admin only)
// @route   DELETE /api/admin/files/:id
// @access  Private/Admin
const deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    await File.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting file'
    });
  }
};

// @desc    Get data usage analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getDataUsageAnalytics = async (req, res) => {
  try {
    const timeframe = req.query.timeframe || '30'; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeframe));

    const analytics = await Promise.all([
      // Daily upload statistics
      File.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            uploads: { $sum: 1 },
            totalSize: { $sum: '$size' },
            processed: {
              $sum: {
                $cond: [{ $eq: ['$status', 'processed'] }, 1, 0]
              }
            },
            failed: {
              $sum: {
                $cond: [{ $eq: ['$status', 'error'] }, 1, 0]
              }
            }
          }
        },
        {
          $sort: {
            '_id.year': 1,
            '_id.month': 1,
            '_id.day': 1
          }
        }
      ]),

      // User activity analysis
      User.aggregate([
        {
          $lookup: {
            from: 'files',
            localField: '_id',
            foreignField: 'userId',
            as: 'files'
          }
        },
        {
          $addFields: {
            fileCount: { $size: '$files' },
            recentActivity: {
              $size: {
                $filter: {
                  input: '$files',
                  cond: { $gte: ['$$this.createdAt', startDate] }
                }
              }
            }
          }
        },
        {
          $match: {
            recentActivity: { $gt: 0 }
          }
        },
        {
          $project: {
            username: 1,
            email: 1,
            role: 1,
            fileCount: 1,
            recentActivity: 1,
            lastLogin: 1
          }
        },
        {
          $sort: { recentActivity: -1 }
        },
        {
          $limit: 10
        }
      ]),

      // Processing performance metrics
      File.aggregate([
        {
          $match: {
            processingCompletedAt: { $exists: true },
            processingStartedAt: { $exists: true }
          }
        },
        {
          $addFields: {
            processingTime: {
              $subtract: ['$processingCompletedAt', '$processingStartedAt']
            }
          }
        },
        {
          $group: {
            _id: null,
            avgProcessingTime: { $avg: '$processingTime' },
            maxProcessingTime: { $max: '$processingTime' },
            minProcessingTime: { $min: '$processingTime' },
            totalFiles: { $sum: 1 }
          }
        }
      ])
    ]);

    const [dailyStats, topUsers, performanceMetrics] = analytics;

    res.status(200).json({
      success: true,
      data: {
        timeframe: `${timeframe} days`,
        dailyStatistics: dailyStats,
        topActiveUsers: topUsers,
        performanceMetrics: performanceMetrics[0] || {
          avgProcessingTime: 0,
          maxProcessingTime: 0,
          minProcessingTime: 0,
          totalFiles: 0
        }
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving analytics data'
    });
  }
};

// Helper function to format bytes
const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

module.exports = {
  getAllUsers,
  getUserDetails,
  updateUser,
  deleteUser,
  getPlatformStats,
  getAllFiles,
  deleteFile,
  getDataUsageAnalytics
};