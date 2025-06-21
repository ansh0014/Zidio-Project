"use client"

const StatsOverview = ({ stats }) => {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const statCards = [
    {
      title: "Total Files",
      value: stats.totalFiles,
      icon: "📊",
      color: "from-blue-500 to-blue-600",
      bgColor: "from-blue-50 to-blue-100 dark:from-blue-900/50 dark:to-blue-800/50",
      change: "+12%",
      changeColor: "text-green-600 dark:text-green-400",
    },
    {
      title: "Storage Used",
      value: formatFileSize(stats.totalSize),
      icon: "💾",
      color: "from-purple-500 to-purple-600",
      bgColor: "from-purple-50 to-purple-100 dark:from-purple-900/50 dark:to-purple-800/50",
      change: "+8%",
      changeColor: "text-green-600 dark:text-green-400",
    },
    {
      title: "This Month",
      value: stats.thisMonth,
      icon: "📈",
      color: "from-green-500 to-green-600",
      bgColor: "from-green-50 to-green-100 dark:from-green-900/50 dark:to-green-800/50",
      change: "+23%",
      changeColor: "text-green-600 dark:text-green-400",
    },
    {
      title: "Avg File Size",
      value: formatFileSize(stats.avgFileSize),
      icon: "⚡",
      color: "from-orange-500 to-orange-600",
      bgColor: "from-orange-50 to-orange-100 dark:from-orange-900/50 dark:to-orange-800/50",
      change: "-5%",
      changeColor: "text-red-600 dark:text-red-400",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <div className="flex items-center mt-2">
                <span className={`text-xs font-medium ${stat.changeColor}`}>{stat.change}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">vs last month</span>
              </div>
            </div>
            <div
              className={`w-12 h-12 bg-gradient-to-br ${stat.bgColor} rounded-xl flex items-center justify-center text-2xl`}
            >
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default StatsOverview
