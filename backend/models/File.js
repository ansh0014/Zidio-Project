const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  originalName: {
    type: String,
    required: [true, 'Original filename is required'],
    trim: true
  },
  filename: {
    type: String,
    required: [true, 'Filename is required'],
    unique: true
  },
  mimetype: {
    type: String,
    required: [true, 'MIME type is required'],
    enum: [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
  },
  size: {
    type: Number,
    required: [true, 'File size is required'],
    min: [1, 'File size must be greater than 0'],
    max: [10485760, 'File size must be less than 10MB']
  },
  status: {
    type: String,
    enum: ['processing', 'processed', 'error'],
    default: 'processing'
  },
  parsedData: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  columnHeaders: [{
    name: String,
    type: String,
    index: Number
  }],
  sampleData: [{
    type: mongoose.Schema.Types.Mixed
  }],
  insights: {
    summary: String,
    keyFindings: [String],
    recommendations: [String],
    dataQuality: {
      completeness: Number,
      consistency: Number,
      accuracy: Number
    },
    aiGenerated: {
      type: Boolean,
      default: false
    },
    generatedAt: Date
  },
  dataStatistics: {
    totalRows: Number,
    totalColumns: Number,
    emptyRows: Number,
    duplicateRows: Number,
    dataTypes: mongoose.Schema.Types.Mixed
  },
  rowCount: {
    type: Number,
    default: 0
  },
  columnCount: {
    type: Number,
    default: 0
  },
  errorMessage: {
    type: String,
    default: null
  },
  processingStartedAt: {
    type: Date,
    default: Date.now
  },
  processingCompletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for better query performance
fileSchema.index({ userId: 1, createdAt: -1 });
fileSchema.index({ status: 1 });

// Virtual for processing duration
fileSchema.virtual('processingDuration').get(function() {
  if (this.processingCompletedAt && this.processingStartedAt) {
    return this.processingCompletedAt - this.processingStartedAt;
  }
  return null;
});

// Method to mark file as processed
fileSchema.methods.markAsProcessed = function(parsedData, rowCount, columnCount) {
  this.status = 'processed';
  this.parsedData = parsedData;
  this.rowCount = rowCount;
  this.columnCount = columnCount;
  this.processingCompletedAt = new Date();
  return this.save();
};

// Method to mark file as error
fileSchema.methods.markAsError = function(errorMessage) {
  this.status = 'error';
  this.errorMessage = errorMessage;
  this.processingCompletedAt = new Date();
  return this.save();
};

// Static method to get user stats
fileSchema.statics.getUserStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalFiles: { $sum: 1 },
        processedFiles: { 
          $sum: { $cond: [{ $eq: ['$status', 'processed'] }, 1, 0] } 
        },
        errorFiles: { 
          $sum: { $cond: [{ $eq: ['$status', 'error'] }, 1, 0] } 
        },
        totalRows: { $sum: '$rowCount' },
        totalSize: { $sum: '$size' },
        avgProcessingTime: { 
          $avg: {
            $cond: [
              { $ne: ['$processingDuration', null] },
              '$processingDuration',
              0
            ]
          }
        }
      }
    }
  ]);

  return stats.length > 0 ? stats[0] : {
    totalFiles: 0,
    processedFiles: 0,
    errorFiles: 0,
    totalRows: 0,
    totalSize: 0,
    avgProcessingTime: 0
  };
};

module.exports = mongoose.model('File', fileSchema);