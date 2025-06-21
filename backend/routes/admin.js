const express = require("express")
const User = require("../models/User")
const File = require("../models/File")
const { adminAuth } = require("../middleware/auth")

const router = express.Router()

// Get all users (admin only)
router.get("/users", adminAuth, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 })

    res.json({ users })
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users", error: error.message })
  }
})

// Get all files (admin only)
router.get("/files", adminAuth, async (req, res) => {
  try {
    const files = await File.find().populate("userId", "name email").select("-data").sort({ createdAt: -1 })

    res.json({ files })
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch files", error: error.message })
  }
})

// Delete user (admin only)
router.delete("/users/:id", adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Delete user's files
    await File.deleteMany({ userId: req.params.id })

    // Delete user
    await User.findByIdAndDelete(req.params.id)

    res.json({ message: "User and associated files deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user", error: error.message })
  }
})

// Delete file (admin only)
router.delete("/files/:id", adminAuth, async (req, res) => {
  try {
    const file = await File.findByIdAndDelete(req.params.id)
    if (!file) {
      return res.status(404).json({ message: "File not found" })
    }

    res.json({ message: "File deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: "Failed to delete file", error: error.message })
  }
})

module.exports = router
