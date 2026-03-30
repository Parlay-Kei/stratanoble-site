'use client'

import { useState, useEffect } from 'react'
import { Smartphone, Download, X, Apple, ChevronRight, Zap, Sparkles, Bell } from 'lucide-react'
import { useDeepLinking } from '@/lib/deepLinking'

interface MobileAppPromotionProps {
  onDismiss?: () => void
  variant?: 'header' | 'banner' | 'card'
  className?: string
}

export function MobileAppPromotion({ 
  onDismiss, 
  variant = 'banner',
  className = '' 
}: MobileAppPromotionProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isAnimating, setIsAnimating] = useState(false)
  const { 
    isMobile, 
    isIOS, 
    isAndroid, 
    appStoreUrl, 
    openMobileApp,
    trackEngagement 
  } = useDeepLinking()

  useEffect(() => {
    // Check if user has already dismissed the promotion
    const dismissed = localStorage.getItem('achievery-mobile-promo-dismissed')
    if (dismissed) {
      const dismissedTime = new Date(dismissed).getTime()
      const currentTime = new Date().getTime()
      const dayInMs = 24 * 60 * 60 * 1000
      
      // Show again after 7 days
      if (currentTime - dismissedTime < dayInMs * 7) {
        setIsVisible(false)
      }
    }
    
    // Add entrance animation
    setTimeout(() => setIsAnimating(true), 100)
  }, [])

  const handleDismiss = () => {
    setIsAnimating(false)
    setTimeout(() => {
      setIsVisible(false)
      localStorage.setItem('achievery-mobile-promo-dismissed', new Date().toISOString())
      
      // Track dismissal
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'mobile_promo_dismissed', {
          variant,
          mobile_device: isMobile
        })
      }
      
      onDismiss?.()
    }, 200)
  }

  const handleDownload = () => {
    // Track download attempt
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'mobile_app_download_click', {
        variant,
        platform: isIOS ? 'ios' : (isAndroid ? 'android' : 'unknown'),
        mobile_device: isMobile
      })
    }
    
    window.open(appStoreUrl, '_blank')
  }
  
  const handleOpenApp = () => {
    // Track open app attempt
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'mobile_app_open_click', {
        variant
      })
    }
    
    openMobileApp('dashboard')
  }

  const getStoreIcon = () => {
    if (isIOS) {
      return <Apple className="w-5 h-5" />
    }
    return <Download className="w-5 h-5" />
  }

  const getStoreText = () => {
    if (isIOS) {
      return 'Download on App Store'
    } else if (isAndroid) {
      return 'Get on Google Play'
    }
    
    return 'Download Mobile App'
  }
  
  const getMobileFeatures = () => {
    return [
      { icon: <Zap className="w-4 h-4" />, text: "Faster logging" },
      { icon: <Bell className="w-4 h-4" />, text: "Push reminders" },
      { icon: <Sparkles className="w-4 h-4" />, text: "Offline access" }
    ]
  }

  if (!isVisible) return null

  // Header variant - compact for navigation bar
  if (variant === 'header') {
    return (
      <div className={`flex items-center space-x-3 transition-all duration-300 ${isAnimating ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'} ${className}`}>
        <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
          <Smartphone className="w-4 h-4" />
          <span>Better on mobile</span>
        </div>
        
        <div className="flex items-center space-x-2">
          {isMobile && (
            <button
              onClick={handleOpenApp}
              className="inline-flex items-center space-x-1 bg-forest-green hover:bg-forest-green text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden sm:inline">Open App</span>
              <span className="sm:hidden">Open</span>
            </button>
          )}
          
          <button
            onClick={handleDownload}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
          >
            {getStoreIcon()}
            <span className="hidden sm:inline">{getStoreText()}</span>
            <span className="sm:hidden">Get App</span>
          </button>
        </div>
      </div>
    )
  }

  // Card variant - for dashboard integration
  if (variant === 'card') {
    const features = getMobileFeatures()
    
    return (
      <div className={`bg-gradient-to-br from-slate-900 via-blue-900 to-emerald-900 rounded-xl p-6 text-white relative overflow-hidden transform transition-all duration-500 ${isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'} ${className}`}>
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white transform translate-x-8 -translate-y-8 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-emerald-400 transform -translate-x-6 translate-y-6 animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 w-16 h-16 rounded-full bg-blue-400 transform -translate-x-8 -translate-y-8 animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative z-10">
          <button
            onClick={handleDismiss}
            className="absolute top-0 right-0 text-white/60 hover:text-white/80 transition-colors p-1 rounded-full hover:bg-white/10"
            aria-label="Dismiss mobile app promotion"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-gradient-to-br from-forest-green to-command-navy rounded-xl shadow-lg">
              <Smartphone className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-lg font-bold">ACHIEVERY Mobile App</h3>
                <Sparkles className="w-5 h-5 text-field-sage animate-pulse" />
              </div>
              
              <p className="text-white/90 text-sm mb-4 leading-relaxed">
                Supercharge your progress tracking with native mobile features designed for busy professionals.
              </p>
              
              {/* Feature highlights */}
              <div className="flex flex-wrap gap-2 mb-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-1 bg-white/10 rounded-full px-3 py-1 text-xs">
                    {feature.icon}
                    <span>{feature.text}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                {isMobile && (
                  <button
                    onClick={handleOpenApp}
                    className="inline-flex items-center justify-center space-x-2 bg-forest-green hover:bg-forest-green text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 text-sm shadow-lg hover:shadow-xl"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Open App Now</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
                
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center justify-center space-x-2 bg-white text-gray-900 hover:bg-void/40 px-4 py-3 rounded-lg font-medium transition-all duration-200 text-sm shadow-lg hover:shadow-xl"
                >
                  {getStoreIcon()}
                  <span>{getStoreText()}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="mt-3 text-xs text-white/70">
                ✨ Same account, synchronized progress, enhanced mobile features
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Banner variant - prominent promotion
  return (
    <div className={`bg-gradient-to-r from-forest-green to-command-navy text-white py-3 px-4 relative transform transition-all duration-300 ${isAnimating ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'} ${className}`}>
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-1 bg-white/20 rounded-lg">
            <Smartphone className="w-5 h-5 flex-shrink-0" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">
              <span className="hidden sm:inline">
                📱 Get faster progress tracking with push notifications and offline access!
              </span>
              <span className="sm:hidden">
                📱 Better mobile experience available!
              </span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {isMobile && (
            <button
              onClick={handleOpenApp}
              className="inline-flex items-center space-x-1 bg-white/30 hover:bg-white/40 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors border border-white/30"
            >
              <span className="hidden sm:inline">Open App</span>
              <span className="sm:hidden">Open</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
          
          <button
            onClick={handleDownload}
            className="inline-flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
          >
            {getStoreIcon()}
            <span className="hidden sm:inline">{getStoreText()}</span>
            <span className="sm:hidden">Get App</span>
          </button>
          
          <button
            onClick={handleDismiss}
            className="text-white/80 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
            aria-label="Dismiss mobile app promotion"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Hook for mobile app detection with enhanced detection
export function useIsMobileAppInstalled() {
  const [isInstalled, setIsInstalled] = useState<boolean | null>(null)
  
  useEffect(() => {
    const checkIfInstalled = async () => {
      try {
        // Try to detect if mobile app is installed
        const userAgent = navigator.userAgent
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches
        const isMobileApp = userAgent.includes('ACHIEVERY-Mobile-App')
        const isPWA = window.matchMedia('(display-mode: minimal-ui)').matches
        
        // Check for app-specific URL scheme support (modern browsers)
        let hasAppScheme = false
        try {
          const controller = new AbortController()
          const signal = controller.signal
          
          // Attempt to open app scheme with timeout
          fetch('achievery://', { signal, mode: 'no-cors' })
            .then(() => {
              hasAppScheme = true
            })
            .catch(() => {
              hasAppScheme = false
            })
          
          // Timeout after 100ms
          setTimeout(() => controller.abort(), 100)
        } catch (e) {
          // Fetch not supported or failed
        }
        
        const installed = isStandalone || isMobileApp || isPWA || hasAppScheme
        setIsInstalled(installed)
        
        // Track app installation status
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'app_installation_check', {
            is_installed: installed,
            detection_method: isStandalone ? 'standalone' : 
                            isMobileApp ? 'user_agent' : 
                            isPWA ? 'pwa' : 
                            hasAppScheme ? 'url_scheme' : 'none'
          })
        }
      } catch (error) {
        setIsInstalled(false)
      }
    }
    
    checkIfInstalled()
  }, [])
  
  return isInstalled
}