const path = require('path');
const fs = require('fs').promises;
const XLSX = require('xlsx');
const multer = require('multer');
const File = require('../models/File');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `excel-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  if (allowedMimes.includes(file.mimetype) || 
      file.originalname.match(/\.(xlsx|xls)$/i)) {
    cb(null, true);
  } else {
    cb(new Error('Only Excel files (.xlsx, .xls) are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 // 10MB
  },
  fileFilter: fileFilter
});

// Process Excel file and extract comprehensive data
const processExcelFile = async (filePath) => {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON with headers
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: null,
      raw: false // Keep original formatting
    });

    if (jsonData.length === 0) {
      throw new Error('Excel file is empty');
    }

    const headers = jsonData[0];
    const rows = jsonData.slice(1);

    // Convert to structured object format
    const structuredData = rows.map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header || `Column_${index + 1}`] = row[index] || null;
      });
      return obj;
    });

    // Analyze data types for each column
    const columnHeaders = headers.map((header, index) => {
      const columnData = rows.map(row => row[index]).filter(val => val !== null && val !== undefined);
      const dataType = analyzeColumnDataType(columnData);
      
      return {
        name: header || `Column_${index + 1}`,
        type: dataType,
        index: index
      };
    });

    // Calculate data statistics
    const emptyRows = rows.filter(row => row.every(cell => !cell || cell.toString().trim() === '')).length;
    const duplicateRows = findDuplicateRows(structuredData);
    
    const dataStatistics = {
      totalRows: rows.length,
      totalColumns: headers.length,
      emptyRows: emptyRows,
      duplicateRows: duplicateRows,
      dataTypes: analyzeDataTypes(structuredData)
    };

    // Generate sample data (first 10 rows for preview)
    const sampleData = structuredData.slice(0, 10);

    return {
      data: structuredData,
      columnHeaders: columnHeaders,
      sampleData: sampleData,
      dataStatistics: dataStatistics,
      rowCount: rows.length,
      columnCount: headers.length
    };
  } catch (error) {
    throw new Error(`Failed to process Excel file: ${error.message}`);
  }
};

// Analyze data type for a column
const analyzeColumnDataType = (columnData) => {
  if (columnData.length === 0) return 'empty';
  
  const types = {
    number: 0,
    date: 0,
    text: 0,
    boolean: 0
  };

  columnData.forEach(value => {
    if (value === null || value === undefined) return;
    
    const str = value.toString().trim();
    if (str === '') return;
    
    // Check if it's a number
    if (!isNaN(str) && !isNaN(parseFloat(str))) {
      types.number++;
    }
    // Check if it's a date
    else if (isValidDate(str)) {
      types.date++;
    }
    // Check if it's boolean
    else if (['true', 'false', 'yes', 'no', '1', '0'].includes(str.toLowerCase())) {
      types.boolean++;
    }
    else {
      types.text++;
    }
  });

  // Return the most common type
  return Object.keys(types).reduce((a, b) => types[a] > types[b] ? a : b);
};

// Check if string is a valid date
const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

// Find duplicate rows
const findDuplicateRows = (data) => {
  const seen = new Set();
  let duplicates = 0;
  
  data.forEach(row => {
    const rowString = JSON.stringify(row);
    if (seen.has(rowString)) {
      duplicates++;
    } else {
      seen.add(rowString);
    }
  });
  
  return duplicates;
};

// Analyze data types distribution
const analyzeDataTypes = (data) => {
  if (data.length === 0) return {};
  
  const typeAnalysis = {};
  const firstRow = data[0];
  
  Object.keys(firstRow).forEach(key => {
    const columnData = data.map(row => row[key]).filter(val => val !== null);
    typeAnalysis[key] = analyzeColumnDataType(columnData);
  });
  
  return typeAnalysis;
};

// Generate comprehensive AI insights using OpenAI or Gemini API
const generateAIInsights = async (data, columnHeaders, dataStatistics) => {
  try {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    const geminiApiKey = process.env.GEMINI_API_KEY;
    
    if (!openaiApiKey && !geminiApiKey) {
      throw new Error('No AI API key configured. Please set OPENAI_API_KEY or GEMINI_API_KEY.');
    }

    // Prepare comprehensive data analysis prompt
    const sampleData = data.slice(0, 20);
    const analysisData = {
      columnHeaders: columnHeaders,
      sampleRows: sampleData,
      statistics: dataStatistics,
      totalRows: data.length
    };

    const prompt = `
    As a data analyst, analyze this Excel dataset and provide comprehensive insights:

    Dataset Overview:
    - Total Rows: ${dataStatistics.totalRows}
    - Total Columns: ${dataStatistics.totalColumns}
    - Empty Rows: ${dataStatistics.emptyRows}
    - Duplicate Rows: ${dataStatistics.duplicateRows}
    
    Column Information:
    ${columnHeaders.map(col => `- ${col.name}: ${col.type} data`).join('\n')}
    
    Sample Data (first 20 rows):
    ${JSON.stringify(sampleData, null, 2)}

    Please provide a detailed analysis in the following JSON format:
    {
      "summary": "Brief overview of the dataset",
      "keyFindings": ["finding1", "finding2", "finding3"],
      "recommendations": ["recommendation1", "recommendation2"],
      "dataQuality": {
        "completeness": 0.95,
        "consistency": 0.90,
        "accuracy": 0.85
      }
    }

    Focus on:
    1. Data quality assessment
    2. Pattern identification
    3. Anomaly detection
    4. Business insights
    5. Actionable recommendations
    `;

    let insights;

    if (openaiApiKey) {
      insights = await generateOpenAIInsights(prompt, openaiApiKey);
    } else {
      insights = await generateGeminiInsights(prompt, geminiApiKey);
    }

    return {
      ...insights,
      aiGenerated: true,
      generatedAt: new Date()
    };

  } catch (error) {
    console.error('AI Insights generation error:', error);
    throw error;
  }
};

// Generate insights using OpenAI
const generateOpenAIInsights = async (prompt, apiKey) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert data analyst. Provide accurate, actionable insights from datasets.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const result = await response.json();
  const content = result.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch (parseError) {
    // Extract JSON from markdown or mixed content
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Invalid JSON response from OpenAI');
  }
};

// Generate insights using Gemini
const generateGeminiInsights = async (prompt, apiKey) => {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1000
        }
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const result = await response.json();
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('No content received from Gemini API');
  }

  try {
    return JSON.parse(text);
  } catch (parseError) {
    // Extract JSON from markdown or mixed content
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Invalid JSON response from Gemini');
  }
};

// @desc    Upload Excel file
// @route   POST /api/files/upload
// @access  Private
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Create file record in database
    const file = await File.create({
      userId: req.user._id,
      originalName: req.file.originalname,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      status: 'processing'
    });

    // Process file asynchronously
    setImmediate(async () => {
      try {
        const filePath = path.join('uploads', req.file.filename);
        
        // Process Excel file with comprehensive analysis
        const { 
          data, 
          columnHeaders, 
          sampleData, 
          dataStatistics, 
          rowCount, 
          columnCount 
        } = await processExcelFile(filePath);
        
        // Generate AI insights if API keys are available
        let insights = null;
        try {
          insights = await generateAIInsights(data, columnHeaders, dataStatistics);
        } catch (aiError) {
          console.log('AI insights generation failed:', aiError.message);
          // Continue without AI insights
        }
        
        // Update file record with comprehensive data
        file.parsedData = data;
        file.columnHeaders = columnHeaders;
        file.sampleData = sampleData;
        file.dataStatistics = dataStatistics;
        file.rowCount = rowCount;
        file.columnCount = columnCount;
        file.status = 'processed';
        file.processingCompletedAt = new Date();
        
        if (insights) {
          file.insights = insights;
        }
        
        await file.save();

        // Clean up uploaded file
        await fs.unlink(filePath);
        
        console.log(`File processed successfully: ${req.file.originalname}`);
      } catch (error) {
        console.error('File processing error:', error);
        await file.markAsError(error.message);
        
        // Clean up uploaded file
        try {
          const filePath = path.join('uploads', req.file.filename);
          await fs.unlink(filePath);
        } catch (unlinkError) {
          console.error('Error deleting file:', unlinkError);
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully and is being processed',
      data: {
        file: {
          id: file._id,
          originalName: file.originalName,
          size: file.size,
          status: file.status,
          uploadedAt: file.createdAt
        }
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up file if it was uploaded
    if (req.file) {
      try {
        const filePath = path.join('uploads', req.file.filename);
        await fs.unlink(filePath);
      } catch (unlinkError) {
        console.error('Error deleting file after error:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'File upload failed'
    });
  }
};

// @desc    Get user's files
// @route   GET /api/files
// @access  Private
const getFiles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const files = await File.find({ userId: req.user._id })
      .select('-parsedData') // Exclude large data from list view
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await File.countDocuments({ userId: req.user._id });

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
    console.error('Get files error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving files'
    });
  }
};

// @desc    Get single file with data
// @route   GET /api/files/:id
// @access  Private
const getFile = async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        file
      }
    });
  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving file'
    });
  }
};

// @desc    Get file data with column headers and sample data
// @route   GET /api/files/:id/data
// @access  Private
const getFileData = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const includeFullData = req.query.full === 'true';

    const file = await File.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    if (file.status !== 'processed') {
      return res.status(400).json({
        success: false,
        message: 'File has not been processed yet',
        status: file.status
      });
    }

    let responseData = {
      fileInfo: {
        id: file._id,
        originalName: file.originalName,
        size: file.size,
        uploadedAt: file.createdAt,
        processedAt: file.processingCompletedAt
      },
      columnHeaders: file.columnHeaders,
      dataStatistics: file.dataStatistics,
      sampleData: file.sampleData
    };

    if (includeFullData) {
      // Return paginated full data
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = file.parsedData.slice(startIndex, endIndex);

      responseData.data = paginatedData;
      responseData.pagination = {
        page,
        limit,
        total: file.parsedData.length,
        pages: Math.ceil(file.parsedData.length / limit)
      };
    }

    res.status(200).json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Get file data error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving file data'
    });
  }
};

// @desc    Delete file
// @route   DELETE /api/files/:id
// @access  Private
const deleteFile = async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

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

// @desc    Regenerate AI insights
// @route   POST /api/files/:id/insights
// @access  Private
const regenerateInsights = async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    if (file.status !== 'processed' || !file.parsedData) {
      return res.status(400).json({
        success: false,
        message: 'File must be processed before generating insights'
      });
    }

    // Extract headers from first row of data
    const headers = file.parsedData.length > 0 ? Object.keys(file.parsedData[0]) : [];
    
    // Generate new insights
    const { insights } = await generateAIInsights(file.parsedData, headers);
    
    // Update file with new insights
    file.insights = insights;
    await file.save();

    res.status(200).json({
      success: true,
      message: 'AI insights regenerated successfully',
      data: {
        insights
      }
    });
  } catch (error) {
    console.error('Regenerate insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Error regenerating insights'
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/files/stats
// @access  Private
const getUserStats = async (req, res) => {
  try {
    const stats = await File.getUserStats(req.user._id);

    res.status(200).json({
      success: true,
      data: {
        stats
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving statistics'
    });
  }
};

module.exports = {
  upload,
  uploadFile,
  getFiles,
  getFile,
  getFileData,
  deleteFile,
  regenerateInsights,
  getUserStats
};