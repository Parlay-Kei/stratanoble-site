'use client'

import { useState, useEffect } from 'react'
import { X, Smartphone, Download, Apple, ArrowRight } from 'lucide-react'
import { useDeepLinking } from '@/lib/deepLinking'

interface SmartAppBannerProps {
  className?: string
  autoShow?: boolean
}

export function SmartAppBanner({ className = '', autoShow = true }: SmartAppBannerProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const {
    shouldShowBanner,
    isMobile,
    appStoreUrl,
    dismissBanner,
    openMobileApp
  } = useDeepLinking()

  useEffect(() => {
    if (autoShow && shouldShowBanner) {
      // Show banner with slight delay for better UX
      const timer = setTimeout(() => {
        setIsVisible(true)
        setIsAnimating(true)
        
        // Remove animation class after animation completes
        setTimeout(() => setIsAnimating(false), 300)
      }, 1500)
      
      return () => clearTimeout(timer)
    }
  }, [autoShow, shouldShowBanner])

  const handleClose = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setIsVisible(false)
      dismissBanner()
    }, 200)
  }

  const handleOpenApp = () => {
    if (isMobile) {
      // Try to open existing app first
      openMobileApp('dashboard')
    } else {
      // Desktop users go to app store
      window.open(appStoreUrl, '_blank')
    }
  }

  const handleDownload = () => {
    window.open(appStoreUrl, '_blank')
  }

  const getDeviceInfo = () => {
    const userAgent = navigator.userAgent
    const isIOS = /iPad|iPhone|iPod/.test(userAgent)
    const isAndroid = /Android/.test(userAgent)
    
    if (isIOS) {
      return {
        platform: 'iOS',
        icon: <Apple className="w-5 h-5" />,
        storeName: 'App Store',
        actionText: 'Download on App Store'
      }
    } else if (isAndroid) {
      return {
        platform: 'Android',
        icon: <Download className="w-5 h-5" />,
        storeName: 'Google Play',
        actionText: 'Get on Google Play'
      }
    }
    
    return {
      platform: 'Mobile',
      icon: <Smartphone className="w-5 h-5" />,
      storeName: 'App Store',
      actionText: 'Download Mobile App'
    }
  }

  if (!isVisible) return null

  const deviceInfo = getDeviceInfo()

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transform transition-transform duration-300 ${
        isAnimating ? 'translate-y-0' : '-translate-y-full'
      } ${className}`}
      style={{
        transform: isVisible ? 'translateY(0)' : 'translateY(-100%)'
      }}
    >
      <div className="bg-gradient-to-r from-slate-900 to-blue-900 text-white shadow-lg border-b border-blue-800">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left side - App info */}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-white text-sm">ACHIEVERY</h3>
                  <span className="text-white/60 text-xs">•</span>
                  <span className="text-white/80 text-xs">Progress Tracking</span>
                </div>
                <p className="text-white/90 text-xs">
                  Native mobile experience with push notifications
                </p>
              </div>
            </div>
            
            {/* Center - Actions */}
            <div className="flex items-center space-x-2">
              {isMobile && (
                <button
                  onClick={handleOpenApp}
                  className="flex items-center space-x-2 bg-forest-green hover:bg-forest-green text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <span>OPEN</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
              
              <button
                onClick={handleDownload}
                className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors border border-white/30"
              >
                {deviceInfo.icon}
                <span className="hidden sm:inline">{deviceInfo.actionText}</span>
                <span className="sm:hidden">GET</span>
              </button>
            </div>
            
            {/* Right side - Close button */}
            <button
              onClick={handleClose}
              className="ml-3 p-1 text-white/60 hover:text-white/80 transition-colors"
              aria-label="Close app banner"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Optional progress indicator for download */}
        <div className="h-1 bg-white/10">
          <div 
            className="h-full bg-gradient-to-r from-emerald-400 to-blue-400 transition-all duration-1000"
            style={{ width: isVisible ? '100%' : '0%' }}
          />
        </div>
      </div>
    </div>
  )
}

/**
 * iOS-style Smart App Banner (appears at top of Safari)
 */
export function IOSSmartBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const { shouldShowBanner, dismissBanner } = useDeepLinking()

  useEffect(() => {
    // Only show on iOS Safari and if conditions are met
    const isIOSSafari = /iPad|iPhone|iPod/.test(navigator.userAgent) && /Safari/.test(navigator.userAgent)
    
    if (isIOSSafari && shouldShowBanner) {
      setIsVisible(true)
    }
  }, [shouldShowBanner])

  const handleClose = () => {
    setIsVisible(false)
    dismissBanner()
  }

  if (!isVisible) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-void/40 border-b border-slate-grey/30 text-black">
      <div className="flex items-center justify-between px-4 py-2 text-sm">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-forest-green to-command-navy rounded-lg flex items-center justify-center">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          
          <div>
            <div className="font-semibold">ACHIEVERY</div>
            <div className="text-gray-600 text-xs">Progress Tracking & Goal Management</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <a
            href="https://apps.apple.com/app/achievery"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            GET
          </a>
          <button
            onClick={handleClose}
            className="p-2 text-slate-grey hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Android-style App Install Banner
 */
export function AndroidInstallBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const { shouldShowBanner, dismissBanner } = useDeepLinking()

  useEffect(() => {
    // Only show on Android Chrome and if conditions are met
    const isAndroidChrome = /Android/.test(navigator.userAgent) && /Chrome/.test(navigator.userAgent)
    
    if (isAndroidChrome && shouldShowBanner) {
      setIsVisible(true)
    }
  }, [shouldShowBanner])

  const handleInstall = () => {
    window.open('https://play.google.com/store/apps/details?id=com.stratanoble.achievery', '_blank')
  }

  const handleClose = () => {
    setIsVisible(false)
    dismissBanner()
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-lg border-t border-slate-grey/25">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-forest-green to-command-navy rounded-lg flex items-center justify-center">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          
          <div>
            <div className="font-semibold text-gray-900">ACHIEVERY</div>
            <div className="text-gray-600 text-sm">Better experience in our app</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleInstall}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            INSTALL
          </button>
          <button
            onClick={handleClose}
            className="p-2 text-slate-grey hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}