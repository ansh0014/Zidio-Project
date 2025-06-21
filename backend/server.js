const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const dotenv = require("dotenv")

// Load environment variables
dotenv.config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use("/api/users", require("./routes/users"))
app.use("/api/files", require("./routes/files"))
app.use("/api/admin", require("./routes/admin"))

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB connected successfully")
    console.log("📊 Database:", mongoose.connection.name)
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message)
    console.error("🔧 Please check your MONGODB_URI in .env file")
    process.exit(1)
  })

// Handle MongoDB connection events
mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err)
})

mongoose.connection.on("disconnected", () => {
  console.log("⚠️ MongoDB disconnected")
})

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "Excel Analytics Platform API" })
})

const PORT = process.env.PORT || 2000
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📡 API available at: http://localhost:${PORT}`)
  console.log(`🌐 Frontend should connect to: http://localhost:${PORT}/api`)
})
