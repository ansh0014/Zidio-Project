"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import FileUpload from "./FileUpload"
import ChartVisualization from "./ChartVisualization"
import FileHistory from "./FileHistory"
import AISummary from "./AISummary"
import StatsOverview from "./StatsOverview"

const Dashboard = () => {
  const [currentFile, setCurrentFile] = useState(null)
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalSize: 0,
    thisMonth: 0,
    avgFileSize: 0,
  })

  useEffect(() => {
    fetchFileHistory()
  }, [])

  const fetchFileHistory = async () => {
    try {
      const response = await axios.get("/files/history")
      const filesData = response.data.files
      setFiles(filesData)

      // Calculate stats
      const totalSize = filesData.reduce((sum, file) => sum + file.size, 0)
      const thisMonth = filesData.filter((file) => {
        const fileDate = new Date(file.createdAt)
        const now = new Date()
        return fileDate.getMonth() === now.getMonth() && fileDate.getFullYear() === now.getFullYear()
      }).length

      setStats({
        totalFiles: filesData.length,
        totalSize,
        thisMonth,
        avgFileSize: filesData.length > 0 ? totalSize / filesData.length : 0,
      })
    } catch (error) {
      console.error("Failed to fetch file history:", error)
    }
  }

  const handleFileUpload = (fileData) => {
    setCurrentFile(fileData)
    fetchFileHistory() // Refresh history and stats
  }

  const handleFileSelect = async (fileId) => {
    setLoading(true)
    try {
      const response = await axios.get(`/files/${fileId}`)
      setCurrentFile(response.data.file)
    } catch (error) {
      console.error("Failed to fetch file:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Analytics Dashboard
              </h1>
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
                Transform your Excel data into powerful insights with AI
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Live Analytics</span>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <StatsOverview stats={stats} />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mt-8">
          {/* Left Column - Upload and History */}
          <div className="xl:col-span-1 space-y-6">
            <FileUpload onFileUpload={handleFileUpload} />
            <FileHistory files={files} onFileSelect={handleFileSelect} loading={loading} />
          </div>

          {/* Right Column - Visualization and AI */}
          <div className="xl:col-span-2 space-y-6">
            {currentFile ? (
              <>
                <ChartVisualization fileData={currentFile} />
                <AISummary fileData={currentFile} />
              </>
            ) : (
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-12 text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-full flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-blue-500 dark:text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">Ready for Analysis</h3>
                <p className="text-gray-600 dark:text-gray-300 text-lg mb-6">
                  Upload an Excel file or select from your history to unlock powerful data insights
                </p>
                <div className="flex items-center justify-center space-x-8 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    AI-Powered Analysis
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                    Interactive Charts
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                    Export Reports
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
