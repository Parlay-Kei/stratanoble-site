'use client'

import React, { useEffect, useState } from 'react'
import { useDeepLinking } from '@/lib/deepLinking'
import { MobileAppPromotion } from './MobileAppPromotion'
import { SmartAppBanner } from './SmartAppBanner'
import { Smartphone, Globe, RefreshCw, Zap, Bell, Download } from 'lucide-react'

interface CrossPlatformIntegrationProps {
  currentRoute?: string
  userEngagement?: {
    actionsLogged: number
    sessionTime: number
    lastActivity: number
  }
}

export const CrossPlatformIntegration: React.FC<CrossPlatformIntegrationProps> = ({
  currentRoute = 'dashboard',
  userEngagement
}) => {
  const [showIntegration, setShowIntegration] = useState(false)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced'>('idle')
  const { 
    isMobile, 
    isIOS, 
    isAndroid, 
    shouldShowBanner, 
    openMobileApp,
    appStoreUrl,
    trackEngagement 
  } = useDeepLinking()

  useEffect(() => {
    // Show integration options based on user engagement
    if (userEngagement) {
      const shouldShow = userEngagement.actionsLogged > 2 || userEngagement.sessionTime > 180000 // 3 minutes
      setShowIntegration(shouldShow)
    }

    // Simulate sync status for demo
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setSyncStatus('syncing')
        setTimeout(() => setSyncStatus('synced'), 2000)
        setTimeout(() => setSyncStatus('idle'), 5000)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [userEngagement])

  const handleSyncData = async () => {
    setSyncStatus('syncing')
    
    // Track sync attempt
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'cross_platform_sync', {
        source: 'web',
        target: 'mobile',
        route: currentRoute
      })
    }

    // Simulate sync process
    setTimeout(() => {
      setSyncStatus('synced')
      setTimeout(() => setSyncStatus('idle'), 3000)
    }, 1500)
  }

  const handleContinueOnMobile = () => {
    trackEngagement('session_time', 60000)
    
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'continue_on_mobile', {
        route: currentRoute,
        device: isMobile ? 'mobile' : 'desktop'
      })
    }

    openMobileApp(currentRoute)
  }

  const getSyncStatusInfo = () => {
    switch (syncStatus) {
      case 'syncing':
        return {
          icon: <RefreshCw className="w-4 h-4 animate-spin" />,
          text: 'Syncing...',
          color: 'text-blue-600'
        }
      case 'synced':
        return {
          icon: <RefreshCw className="w-4 h-4 text-green-600" />,
          text: 'Synced',
          color: 'text-green-600'
        }
      default:
        return {
          icon: <RefreshCw className="w-4 h-4" />,
          text: 'Sync',
          color: 'text-gray-600'
        }
    }
  }

  const getPlatformFeatures = () => {
    return [
      {
        icon: <Bell className="w-5 h-5 text-emerald-500" />,
        title: 'Push Notifications',
        description: 'Daily reminders and streak maintenance',
        available: isMobile
      },
      {
        icon: <Zap className="w-5 h-5 text-blue-500" />,
        title: 'Offline Access',
        description: 'Log actions without internet connection',
        available: isMobile
      },
      {
        icon: <Globe className="w-5 h-5 text-purple-500" />,
        title: 'Full Dashboard',
        description: 'Complete analytics and reporting',
        available: !isMobile
      },
      {
        icon: <Smartphone className="w-5 h-5 text-orange-500" />,
        title: 'Quick Logging',
        description: 'Faster action entry with mobile UI',
        available: isMobile
      }
    ]
  }

  if (!showIntegration && !shouldShowBanner) {
    return null
  }

  const statusInfo = getSyncStatusInfo()
  const features = getPlatformFeatures()

  return (
    <div className="space-y-4">
      {/* Smart App Banner */}
      {shouldShowBanner && <SmartAppBanner />}
      
      {/* Cross-Platform Integration Card */}
      {showIntegration && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Cross-Platform Experience</h3>
                <p className="text-sm text-gray-600">Seamless progress tracking across all devices</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSyncData}
                disabled={syncStatus === 'syncing'}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  syncStatus === 'syncing' 
                    ? 'bg-blue-100 text-blue-600 cursor-not-allowed' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {statusInfo.icon}
                <span>{statusInfo.text}</span>
              </button>
            </div>
          </div>

          {/* Platform Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`flex items-start space-x-3 p-3 rounded-lg transition-colors ${
                  feature.available 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className={`flex-shrink-0 ${feature.available ? 'opacity-100' : 'opacity-50'}`}>
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <h4 className={`font-medium text-sm ${
                    feature.available ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {feature.title}
                  </h4>
                  <p className={`text-xs ${
                    feature.available ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {feature.description}
                  </p>
                  {feature.available && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                      Available
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {isMobile && (
              <button
                onClick={handleContinueOnMobile}
                className="flex-1 inline-flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-lg font-medium transition-colors"
              >
                <Smartphone className="w-4 h-4" />
                <span>Continue in Mobile App</span>
              </button>
            )}
            
            <a
              href={appStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-medium transition-colors"
              onClick={() => {
                if (typeof window !== 'undefined' && (window as any).gtag) {
                  (window as any).gtag('event', 'app_store_click', {
                    source: 'cross_platform_integration',
                    platform: isIOS ? 'ios' : (isAndroid ? 'android' : 'unknown')
                  })
                }
              }}
            >
              <Download className="w-4 h-4" />
              <span>
                {isIOS ? 'Get iOS App' : (isAndroid ? 'Get Android App' : 'Download App')}
              </span>
            </a>
          </div>

          {/* Data Sync Notice */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <span className="font-medium">🔄 Automatic Sync:</span> Your progress automatically syncs across all devices when you're online. No data loss, ever.
            </p>
          </div>
        </div>
      )}

      {/* Mobile App Promotion Fallback */}
      {!showIntegration && shouldShowBanner && isMobile && (
        <MobileAppPromotion variant="card" />
      )}
    </div>
  )
}

export default CrossPlatformIntegration