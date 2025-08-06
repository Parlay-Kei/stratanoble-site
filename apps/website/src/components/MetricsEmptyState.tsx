'use client'

interface MetricsEmptyStateProps {
  title?: string
  message?: string
  showNextUpdate?: boolean
}

export default function MetricsEmptyState({ 
  title = "Metrics Loading",
  message = "Numbers roll in every six hours; first pull is pending.",
  showNextUpdate = true 
}: MetricsEmptyStateProps) {
  
  // Calculate next 6-hour window (0, 6, 12, 18 UTC)
  const getNextUpdateTime = () => {
    const now = new Date()
    const currentHour = now.getUTCHours()
    const nextUpdateHours = [0, 6, 12, 18]
    
    let nextHour = nextUpdateHours.find(hour => hour > currentHour)
    if (!nextHour) {
      nextHour = nextUpdateHours[0] + 24 // Next day
    }
    
    const nextUpdate = new Date(now)
    nextUpdate.setUTCHours(nextHour, 0, 0, 0)
    
    return nextUpdate.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZoneName: 'short' 
    })
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center">
      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-blue-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      
      <p className="text-gray-600 mb-4 max-w-md">
        {message}
      </p>

      {showNextUpdate && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-w-sm">
          <p className="text-sm text-gray-700">
            <span className="font-medium">Next update:</span> {getNextUpdateTime()}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Metrics are collected every 6 hours automatically
          </p>
        </div>
      )}

      <div className="mt-6 flex items-center justify-center space-x-2">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        <span className="text-sm text-gray-500 ml-2">Collecting data...</span>
      </div>
    </div>
  )
}