const express = require("express")
const multer = require("multer")
const XLSX = require("xlsx")
const { GoogleGenerativeAI } = require("@google/generative-ai")
const File = require("../models/File")
const { auth } = require("../middleware/auth")

const router = express.Router()

// Configure multer for file uploads
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.includes("spreadsheet") ||
      file.originalname.endsWith(".xlsx") ||
      file.originalname.endsWith(".xls")
    ) {
      cb(null, true)
    } else {
      cb(new Error("Only Excel files are allowed"), false)
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
})

// Initialize Gemini AI with error handling
let genAI = null
try {
  if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    console.log("✅ Gemini AI initialized successfully")
  } else {
    console.warn("⚠️ GEMINI_API_KEY not found in environment variables")
  }
} catch (error) {
  console.error("❌ Failed to initialize Gemini AI:", error.message)
}

// Upload Excel file
router.post("/upload", auth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" })
    }

    // Parse Excel file
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const jsonData = XLSX.utils.sheet_to_json(worksheet)

    // Save file to database
    const file = new File({
      filename: `${Date.now()}-${req.file.originalname}`,
      originalName: req.file.originalname,
      userId: req.user._id,
      data: jsonData,
      size: req.file.size,
    })

    await file.save()

    res.json({
      message: "File uploaded successfully",
      file: {
        id: file._id,
        filename: file.filename,
        originalName: file.originalName,
        data: jsonData,
        size: file.size,
        createdAt: file.createdAt,
      },
    })
  } catch (error) {
    console.error("Upload error:", error)
    res.status(500).json({ message: "Upload failed", error: error.message })
  }
})

// Get file history
router.get("/history", auth, async (req, res) => {
  try {
    const files = await File.find({ userId: req.user._id }).select("-data").sort({ createdAt: -1 })

    res.json({ files })
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch history", error: error.message })
  }
})

// Get specific file data
router.get("/:id", auth, async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      userId: req.user._id,
    })

    if (!file) {
      return res.status(404).json({ message: "File not found" })
    }

    res.json({ file })
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch file", error: error.message })
  }
})

// Generate AI summary
router.post("/summary", auth, async (req, res) => {
  try {
    const { fileId, data } = req.body

    console.log("📊 AI Summary request received")
    console.log("🔑 API Key available:", !!process.env.GEMINI_API_KEY)
    console.log("📁 File ID:", fileId)
    console.log("📋 Data length:", data?.length)

    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ message: "No data provided for summary" })
    }

    // Check if Gemini AI is available
    if (!genAI) {
      console.error("❌ Gemini AI not initialized")
      return res.status(500).json({
        message: "AI service not available. Please check GEMINI_API_KEY configuration.",
        error: "GEMINI_API_KEY not configured",
      })
    }

    // Prepare data for AI analysis
    const dataPreview = data.slice(0, 10) // First 10 rows
    const columns = Object.keys(data[0] || {})
    const rowCount = data.length

    console.log("📊 Data analysis:")
    console.log("- Columns:", columns)
    console.log("- Row count:", rowCount)
    console.log("- Sample data:", JSON.stringify(dataPreview[0], null, 2))

    const prompt = `
    Analyze this Excel data and provide comprehensive insights:
    
    Data Overview:
    - Total rows: ${rowCount}
    - Columns: ${columns.join(", ")}
    
    Sample data (first 10 rows):
    ${JSON.stringify(dataPreview, null, 2)}
    
    Please provide:
    1. A brief summary of the data structure and content
    2. Key insights and patterns you can identify
    3. Statistical observations (trends, distributions, outliers)
    4. Recommendations for data visualization
    5. Notable findings or anomalies
    6. Suggestions for further analysis
    
    Keep the response detailed but well-structured and actionable.
    `

    console.log("🤖 Sending request to Gemini AI...")

    try {
      // Try different model names in order of preference
      const modelNames = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-1.0-pro"]

      let result = null
      let usedModel = null

      for (const modelName of modelNames) {
        try {
          console.log(`🔄 Trying model: ${modelName}`)
          const model = genAI.getGenerativeModel({ model: modelName })
          result = await model.generateContent(prompt)
          usedModel = modelName
          console.log(`✅ Successfully used model: ${modelName}`)
          break
        } catch (modelError) {
          console.log(`❌ Model ${modelName} failed:`, modelError.message)
          continue
        }
      }

      if (!result || !result.response) {
        throw new Error("All available models failed to generate content")
      }

      const summary = result.response.text()

      console.log("✅ AI Summary generated successfully")
      console.log("🤖 Used model:", usedModel)
      console.log("📝 Summary length:", summary.length)

      // Update file with summary if fileId provided
      if (fileId) {
        try {
          await File.findOneAndUpdate({ _id: fileId, userId: req.user._id }, { summary }, { new: true })
          console.log("💾 Summary saved to database")
        } catch (dbError) {
          console.error("⚠️ Failed to save summary to database:", dbError.message)
          // Continue anyway, we still have the summary to return
        }
      }

      res.json({
        summary,
        model: usedModel,
        message: "AI analysis completed successfully",
      })
    } catch (aiError) {
      console.error("❌ Gemini AI Error:", aiError)

      // Provide more specific error messages
      let errorMessage = "Failed to generate AI summary"

      if (aiError.message.includes("API_KEY") || aiError.message.includes("401")) {
        errorMessage = "Invalid Gemini API key. Please check your configuration."
      } else if (aiError.message.includes("quota") || aiError.message.includes("429")) {
        errorMessage = "API quota exceeded. Please try again later."
      } else if (aiError.message.includes("safety")) {
        errorMessage = "Content filtered by AI safety systems. Try with different data."
      } else if (aiError.message.includes("network") || aiError.message.includes("fetch")) {
        errorMessage = "Network error connecting to AI service. Please try again."
      } else if (aiError.message.includes("404") || aiError.message.includes("not found")) {
        errorMessage = "AI model not available. The service may be temporarily unavailable."
      }

      return res.status(500).json({
        message: errorMessage,
        error: aiError.message,
        details: "Please ensure your GEMINI_API_KEY is valid and has sufficient quota.",
      })
    }
  } catch (error) {
    console.error("💥 Summary generation error:", error)
    res.status(500).json({
      message: "Failed to generate summary",
      error: error.message,
    })
  }
})

module.exports = router
