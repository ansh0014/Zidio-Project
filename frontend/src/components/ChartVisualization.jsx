"use client"

import { useState, useEffect, useRef } from "react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js"
import { Bar, Line, Pie } from "react-chartjs-2"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement)

const ChartVisualization = ({ fileData }) => {
  const [chartType, setChartType] = useState("bar")
  const [xAxis, setXAxis] = useState("")
  const [yAxis, setYAxis] = useState("")
  const [chartData, setChartData] = useState(null)
  const [downloading, setDownloading] = useState(false)
  const [chartKey, setChartKey] = useState(0) // Force chart re-render
  const chartRef = useRef(null)

  const data = fileData?.data || []
  const columns = data.length > 0 ? Object.keys(data[0]) : []

  // Reset chart when fileData changes
  useEffect(() => {
    if (fileData) {
      console.log("📊 New file data received:", fileData.originalName)
      setChartData(null) // Clear previous chart data
      setChartKey((prev) => prev + 1) // Force chart re-render

      // Reset axis selections for new file
      if (columns.length > 0) {
        setXAxis(columns[0])
        setYAxis(columns.length > 1 ? columns[1] : columns[0])
      }
    }
  }, [fileData]) // Depend on fileData object

  // Set initial axis values when columns change
  useEffect(() => {
    if (columns.length > 0 && !xAxis) {
      setXAxis(columns[0])
    }
    if (columns.length > 1 && !yAxis) {
      setYAxis(columns[1])
    }
  }, [columns])

  // Generate chart data when dependencies change
  useEffect(() => {
    if (xAxis && yAxis && data.length > 0) {
      console.log("🔄 Generating chart data for:", { xAxis, yAxis, rows: data.length })
      generateChartData()
    }
  }, [xAxis, yAxis, chartType, data, fileData])

  const generateChartData = () => {
    try {
      const labels = data.map((row) => String(row[xAxis] || "")).slice(0, 20)
      const values = data
        .map((row) => {
          const value = row[yAxis]
          return isNaN(value) ? 0 : Number(value)
        })
        .slice(0, 20)

      console.log("📈 Chart data generated:", {
        labels: labels.slice(0, 3),
        values: values.slice(0, 3),
        totalPoints: labels.length,
      })

      const colors = [
        "rgba(59, 130, 246, 0.8)",
        "rgba(16, 185, 129, 0.8)",
        "rgba(245, 101, 101, 0.8)",
        "rgba(251, 191, 36, 0.8)",
        "rgba(139, 92, 246, 0.8)",
        "rgba(236, 72, 153, 0.8)",
        "rgba(34, 197, 94, 0.8)",
        "rgba(249, 115, 22, 0.8)",
      ]

      const chartConfig = {
        labels,
        datasets: [
          {
            label: yAxis,
            data: values,
            backgroundColor: chartType === "pie" ? colors.slice(0, labels.length) : "rgba(59, 130, 246, 0.8)",
            borderColor: chartType === "pie" ? colors.slice(0, labels.length) : "rgba(59, 130, 246, 1)",
            borderWidth: 2,
            borderRadius: chartType === "bar" ? 8 : 0,
          },
        ],
      }

      setChartData(chartConfig)
    } catch (error) {
      console.error("❌ Error generating chart data:", error)
      setChartData(null)
    }
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: "500",
          },
        },
      },
      title: {
        display: true,
        text: `${yAxis} by ${xAxis}`,
        font: {
          size: 16,
          weight: "bold",
        },
        padding: 20,
      },
    },
    scales:
      chartType !== "pie"
        ? {
            y: {
              beginAtZero: true,
              grid: {
                color: "rgba(0, 0, 0, 0.1)",
              },
            },
            x: {
              grid: {
                display: false,
              },
            },
          }
        : undefined,
    // Force chart to redraw completely
    animation: {
      duration: 1000,
    },
  }

  const downloadReport = async () => {
    setDownloading(true)
    try {
      const pdf = new jsPDF("p", "mm", "a4")

      // Add title
      pdf.setFontSize(20)
      pdf.setTextColor(59, 130, 246)
      pdf.text("Excel Analytics Report", 20, 30)

      // Add file info
      pdf.setFontSize(12)
      pdf.setTextColor(0, 0, 0)
      pdf.text(`File: ${fileData.originalName}`, 20, 45)
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 55)
      pdf.text(`Total Records: ${data.length}`, 20, 65)

      // Capture chart
      if (chartRef.current) {
        const canvas = await html2canvas(chartRef.current, {
          backgroundColor: "#ffffff",
          scale: 2,
        })
        const imgData = canvas.toDataURL("image/png")
        pdf.addImage(imgData, "PNG", 20, 80, 170, 100)
      }

      // Add AI summary if available
      if (fileData.summary) {
        pdf.addPage()
        pdf.setFontSize(16)
        pdf.setTextColor(59, 130, 246)
        pdf.text("AI Insights", 20, 30)

        pdf.setFontSize(10)
        pdf.setTextColor(0, 0, 0)
        const splitSummary = pdf.splitTextToSize(fileData.summary, 170)
        pdf.text(splitSummary, 20, 45)
      }

      pdf.save(`${fileData.originalName}_report.pdf`)
    } catch (error) {
      console.error("Download failed:", error)
    } finally {
      setDownloading(false)
    }
  }

  const renderChart = () => {
    if (!chartData) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-500 dark:text-gray-400">Generating chart...</p>
          </div>
        </div>
      )
    }

    const commonProps = {
      data: chartData,
      options: chartOptions,
      key: `${chartType}-${xAxis}-${yAxis}-${chartKey}`, // Unique key for each chart
    }

    switch (chartType) {
      case "bar":
        return <Bar {...commonProps} />
      case "line":
        return <Line {...commonProps} />
      case "pie":
        return <Pie {...commonProps} />
      default:
        return <Bar {...commonProps} />
    }
  }

  if (!fileData || !data.length) {
    return (
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Data Visualization</h2>
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
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">No data to visualize</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Upload an Excel file to get started</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mr-3">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Data Visualization
          </h2>
        </div>

        <button
          onClick={downloadReport}
          disabled={downloading}
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 flex items-center space-x-2 shadow-lg hover:shadow-xl"
        >
          {downloading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>Download Report</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Chart Type</label>
          <select
            value={chartType}
            onChange={(e) => {
              console.log("📊 Chart type changed to:", e.target.value)
              setChartType(e.target.value)
            }}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-white"
          >
            <option value="bar">📊 Bar Chart</option>
            <option value="line">📈 Line Chart</option>
            <option value="pie">🥧 Pie Chart</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">X-Axis</label>
          <select
            value={xAxis}
            onChange={(e) => {
              console.log("📊 X-axis changed to:", e.target.value)
              setXAxis(e.target.value)
            }}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-white"
          >
            {columns.map((column) => (
              <option key={column} value={column}>
                {column}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Y-Axis</label>
          <select
            value={yAxis}
            onChange={(e) => {
              console.log("📊 Y-axis changed to:", e.target.value)
              setYAxis(e.target.value)
            }}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm text-gray-900 dark:text-white"
          >
            {columns.map((column) => (
              <option key={column} value={column}>
                {column}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div
        ref={chartRef}
        className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 rounded-xl border border-gray-200 dark:border-gray-600 shadow-inner"
        style={{ height: "400px" }}
      >
        {renderChart()}
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/50 dark:to-blue-800/50 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
          <p className="text-sm font-medium text-blue-800 dark:text-blue-300">File Name</p>
          <p className="text-blue-900 dark:text-blue-200 font-semibold truncate">{fileData.originalName}</p>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/50 dark:to-green-800/50 p-4 rounded-lg border border-green-200 dark:border-green-700">
          <p className="text-sm font-medium text-green-800 dark:text-green-300">Total Records</p>
          <p className="text-green-900 dark:text-green-200 font-semibold">{data.length.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/50 dark:to-purple-800/50 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
          <p className="text-sm font-medium text-purple-800 dark:text-purple-300">Displaying</p>
          <p className="text-purple-900 dark:text-purple-200 font-semibold">{Math.min(20, data.length)} rows</p>
        </div>
      </div>
    </div>
  )
}

export default ChartVisualization
