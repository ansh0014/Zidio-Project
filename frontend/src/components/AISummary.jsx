"use client"

import { useState, useEffect } from "react"
import axios from "axios"

const AISummary = ({ fileData }) => {
  const [summary, setSummary] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Reset summary when fileData changes
  useEffect(() => {
    if (fileData) {
      console.log("🤖 New file data for AI summary:", fileData.originalName)
      setSummary(fileData?.summary || "")
      setError("")
    }
  }, [fileData])

  const generateSummary = async () => {
    if (!fileData?.data) return

    setLoading(true)
    setError("")

    try {
      console.log("🤖 Generating AI summary for file:", fileData._id)
      console.log("📊 Data sample:", fileData.data.slice(0, 3))

      const response = await axios.post("/files/summary", {
        fileId: fileData._id,
        data: fileData.data,
      })

      console.log("✅ AI Summary response:", response.data)
      setSummary(response.data.summary)
    } catch (error) {
      console.error("❌ AI Summary error:", error)
      console.error("📋 Error response:", error.response?.data)
      setError(error.response?.data?.message || "Failed to generate summary. Please check your Gemini API key.")
    } finally {
      setLoading(false)
    }
  }

  const downloadSummary = () => {
    if (!summary) return

    const element = document.createElement("a")
    const file = new Blob([summary], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `${fileData.originalName}_ai_insights.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  if (!fileData) {
    return (
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">AI Insights</h2>
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400 dark:text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Select a file to get AI insights</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Upload an Excel file to get started</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            AI Insights
          </h2>
        </div>

        <div className="flex space-x-3">
          {summary && (
            <button
              onClick={downloadSummary}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>Download</span>
            </button>
          )}

          <button
            onClick={generateSummary}
            disabled={loading}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 flex items-center space-x-2 shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Generate Insights</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {error}
          </div>
        </div>
      )}

      {summary ? (
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6 shadow-inner">
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-blue-900 dark:text-blue-200 mb-3 flex items-center">
                <span className="mr-2">🤖</span>
                AI Analysis Results
              </h3>
              <div className="prose prose-blue max-w-none">
                <div className="text-blue-800 dark:text-blue-200 whitespace-pre-wrap leading-relaxed text-sm">
                  {summary}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/50 dark:to-indigo-900/50 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-purple-500 dark:text-purple-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">Unlock AI-Powered Insights</h3>
          <p className="text-gray-600 dark:text-gray-300 text-lg mb-6 max-w-md mx-auto">
            Get intelligent analysis, patterns, and recommendations for your Excel data using advanced AI
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto text-sm">
            <div className="flex items-center justify-center space-x-2 text-gray-500 dark:text-gray-400">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Data Patterns</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-gray-500 dark:text-gray-400">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>Trend Analysis</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-gray-500 dark:text-gray-400">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>Recommendations</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AISummary
