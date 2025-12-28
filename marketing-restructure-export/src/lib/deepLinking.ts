/**
 * Deep Linking Utilities for ACHIEVERY Cross-Platform Integration
 * Handles web-to-mobile app transitions and smart app banners
 */

export interface DeepLinkConfig {
  path: string
  fallbackUrl?: string
  params?: Record<string, string>
}

export class DeepLinkManager {
  private static readonly IOS_APP_STORE_URL = 'https://apps.apple.com/app/achievery'
  private static readonly ANDROID_PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.stratanoble.achievery'
  private static readonly DEEP_LINK_SCHEME = 'achievery'
  
  static isIOS(userAgent?: string): boolean {
    const ua = userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : '')
    return /iPad|iPhone|iPod/.test(ua)
  }
  
  static isAndroid(userAgent?: string): boolean {
    const ua = userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : '')
    return /Android/.test(ua)
  }
  
  static isMobile(userAgent?: string): boolean {
    return this.isIOS(userAgent) || this.isAndroid(userAgent)
  }
  
  static getAppStoreUrl(userAgent?: string): string {
    if (this.isIOS(userAgent)) return this.IOS_APP_STORE_URL
    if (this.isAndroid(userAgent)) return this.ANDROID_PLAY_STORE_URL
    return this.IOS_APP_STORE_URL // Default fallback
  }
  
  /**
   * Generate deep link URL for mobile app
   */
  static createDeepLink(config: DeepLinkConfig): string {
    const { path, params = {} } = config
    let deepLink = `${this.DEEP_LINK_SCHEME}://${path}`
    
    const queryParams = new URLSearchParams(params).toString()
    if (queryParams) {
      deepLink += `?${queryParams}`
    }
    
    return deepLink
  }
  
  /**
   * Attempt to open mobile app, fallback to app store
   */
  static async attemptDeepLink(config: DeepLinkConfig): Promise<void> {
    // Track deep link attempt
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'deep_link_attempt', {
        path: config.path,
        platform: this.isMobile() ? (this.isIOS() ? 'ios' : 'android') : 'desktop',
        has_fallback: !!config.fallbackUrl
      })
    }

    if (!this.isMobile()) {
      // On desktop, open fallback URL or current page
      if (config.fallbackUrl) {
        window.open(config.fallbackUrl, '_blank')
      }
      return
    }
    
    const deepLink = this.createDeepLink(config)
    const appStoreUrl = this.getAppStoreUrl()
    let appOpened = false
    
    try {
      // Create a hidden iframe to attempt app launch
      const iframe = document.createElement('iframe')
      iframe.style.display = 'none'
      document.body.appendChild(iframe)
      
      // Set a flag to detect if app opened
      const startTime = Date.now()
      
      // Listen for blur event (indicates app opened)
      const handleBlur = () => {
        appOpened = true
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'deep_link_success', {
            path: config.path,
            response_time: Date.now() - startTime
          })
        }
      }
      
      window.addEventListener('blur', handleBlur, { once: true })
      
      // Try to open the mobile app via iframe first
      iframe.src = deepLink
      
      // If app doesn't open within 2.5 seconds, redirect to app store
      setTimeout(() => {
        window.removeEventListener('blur', handleBlur)
        document.body.removeChild(iframe)
        
        if (!appOpened && !document.hidden) {
          if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'deep_link_fallback', {
              path: config.path,
              fallback_type: 'app_store'
            })
          }
          window.open(appStoreUrl, '_blank')
        }
      }, 2500)
      
    } catch (error) {
      // Fallback to app store
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'deep_link_error', {
          path: config.path,
          error: error instanceof Error ? error.message : 'unknown'
        })
      }
      window.open(appStoreUrl, '_blank')
    }
  }
  
  /**
   * Smart app install banner detection
   */
  static shouldShowAppBanner(): boolean {
    // Don't show if app is already installed (detected by standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return false
    }
    
    // Don't show if user agent indicates mobile app
    if (navigator.userAgent.includes('ACHIEVERY-Mobile-App')) {
      return false
    }
    
    // Check for PWA installation
    if (window.matchMedia('(display-mode: minimal-ui)').matches) {
      return false
    }
    
    // Check if user has dismissed banner recently
    const dismissed = localStorage.getItem('achievery-app-banner-dismissed')
    if (dismissed) {
      const dismissedTime = new Date(dismissed).getTime()
      const currentTime = new Date().getTime()
      const weekInMs = 7 * 24 * 60 * 60 * 1000
      
      // Don't show for a week after dismissal
      if (currentTime - dismissedTime < weekInMs) {
        return false
      }
    }
    
    // Check user engagement level - only show to engaged users
    const engagementData = localStorage.getItem('achievery-engagement')
    if (engagementData) {
      const engagement = JSON.parse(engagementData)
      // Show banner if user has logged actions or spent significant time
      return engagement.actionsLogged > 0 || engagement.sessionTime > 300000 // 5 minutes
    }
    
    return this.isMobile()
  }
  
  /**
   * Dismiss app banner and store preference
   */
  static dismissAppBanner(): void {
    localStorage.setItem('achievery-app-banner-dismissed', new Date().toISOString())
  }
  
  /**
   * Pre-configured deep links for common ACHIEVERY routes
   */
  static readonly routes = {
    dashboard: () => this.createDeepLink({ path: 'dashboard' }),
    actions: () => this.createDeepLink({ path: 'actions' }),
    addAction: () => this.createDeepLink({ path: 'actions/add' }),
    narratives: () => this.createDeepLink({ path: 'narratives' }),
    roadmap: () => this.createDeepLink({ path: 'roadmap' }),
    profile: () => this.createDeepLink({ path: 'profile' }),
    
    // Parameterized routes
    actionDetail: (actionId: string) => this.createDeepLink({ 
      path: 'actions/detail', 
      params: { id: actionId } 
    }),
    narrativeDetail: (narrativeId: string) => this.createDeepLink({ 
      path: 'narratives/detail', 
      params: { id: narrativeId } 
    }),
    
    // Strata Noble integration routes
    services: () => this.createDeepLink({ path: 'services' }),
    consultation: () => this.createDeepLink({ path: 'consultation' }),
    resources: () => this.createDeepLink({ path: 'resources' }),
    community: () => this.createDeepLink({ path: 'community' }),
  }
  
  /**
   * Track user engagement for smart banner targeting
   */
  static trackEngagement(event: 'action_logged' | 'session_time', data?: any): void {
    try {
      const existing = localStorage.getItem('achievery-engagement')
      const engagement = existing ? JSON.parse(existing) : {
        actionsLogged: 0,
        sessionTime: 0,
        lastActivity: Date.now()
      }
      
      if (event === 'action_logged') {
        engagement.actionsLogged += 1
      } else if (event === 'session_time') {
        engagement.sessionTime += data || 60000 // Default 1 minute
      }
      
      engagement.lastActivity = Date.now()
      localStorage.setItem('achievery-engagement', JSON.stringify(engagement))
    } catch (error) {
      console.warn('Failed to track engagement:', error)
    }
  }
  
  /**
   * Generate web fallback URLs for deep links
   */
  static generateWebFallback(path: string, params?: Record<string, string>): string {
    const baseUrl = 'https://stratanoble.com/achievery'
    let webUrl = `${baseUrl}/${path}`
    
    if (params) {
      const queryParams = new URLSearchParams(params).toString()
      if (queryParams) {
        webUrl += `?${queryParams}`
      }
    }
    
    return webUrl
  }
}

/**
 * React hook for deep linking functionality
 */
export function useDeepLinking() {
  const attemptDeepLink = (config: DeepLinkConfig) => {
    return DeepLinkManager.attemptDeepLink(config)
  }
  
  const openMobileApp = (path: string, params?: Record<string, string>) => {
    const fallbackUrl = DeepLinkManager.generateWebFallback(path, params)
    return attemptDeepLink({ path, params, fallbackUrl })
  }
  
  const trackEngagement = (event: 'action_logged' | 'session_time', data?: any) => {
    DeepLinkManager.trackEngagement(event, data)
  }
  
  const shouldShowBanner = DeepLinkManager.shouldShowAppBanner()
  const isMobile = DeepLinkManager.isMobile()
  const isIOS = DeepLinkManager.isIOS()
  const isAndroid = DeepLinkManager.isAndroid()
  const appStoreUrl = DeepLinkManager.getAppStoreUrl()
  
  return {
    attemptDeepLink,
    openMobileApp,
    trackEngagement,
    shouldShowBanner,
    isMobile,
    isIOS,
    isAndroid,
    appStoreUrl,
    dismissBanner: DeepLinkManager.dismissAppBanner,
    routes: DeepLinkManager.routes
  }
}

/**
 * Middleware for handling app links in Next.js
 */
export function handleAppLink(request: Request): Response | null {
  const url = new URL(request.url)
  
  // Check for app link parameters
  if (url.searchParams.has('app_link')) {
    const appPath = url.searchParams.get('app_path') || 'dashboard'
    const deepLink = DeepLinkManager.createDeepLink({ path: appPath })
    
    // Get user agent from request headers for server-side detection
    const userAgent = (request as any).headers?.get?.('user-agent') || ''
    const appStoreUrl = DeepLinkManager.getAppStoreUrl(userAgent)
    
    // Create HTML response that attempts to open mobile app
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Opening ACHIEVERY App...</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #001122 0%, #002244 100%);
              color: white;
              text-align: center;
            }
            .container {
              max-width: 400px;
              padding: 2rem;
            }
            .spinner {
              width: 40px;
              height: 40px;
              border: 3px solid #50C878;
              border-radius: 50%;
              border-top-color: transparent;
              animation: spin 1s linear infinite;
              margin: 0 auto 1rem;
            }
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
            .fallback-link {
              display: inline-block;
              margin-top: 1rem;
              padding: 0.75rem 1.5rem;
              background: #50C878;
              color: #001122;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="spinner"></div>
            <h1>Opening ACHIEVERY...</h1>
            <p>If the app doesn't open automatically, tap the link below:</p>
            <a href="${appStoreUrl}" class="fallback-link">
              Download ACHIEVERY App
            </a>
          </div>
          <script>
            // Attempt to open mobile app
            window.location.href = "${deepLink}";
            
            // Fallback to app store after 3 seconds
            setTimeout(() => {
              if (!document.hidden) {
                window.location.href = "${appStoreUrl}";
              }
            }, 3000);
          </script>
        </body>
      </html>
    `
    
    return new Response(html, {
      headers: { 'Content-Type': 'text/html' }
    })
  }
  
  return null
}
