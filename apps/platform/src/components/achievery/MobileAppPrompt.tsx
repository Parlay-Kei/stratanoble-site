'use client';

import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone, Apple, PlayCircle } from 'lucide-react';

interface MobileAppPromptProps {
  onDismiss?: () => void;
  variant?: 'banner' | 'modal' | 'inline';
  className?: string;
}

export const MobileAppPrompt: React.FC<MobileAppPromptProps> = ({
  onDismiss,
  variant = 'banner',
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [userAgent, setUserAgent] = useState('');

  useEffect(() => {
    // Check if user is on mobile and hasn't dismissed the prompt
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const hasSeenPrompt = localStorage.getItem('achievery-mobile-prompt-dismissed');
    
    if (isMobile && !hasSeenPrompt) {
      setIsVisible(true);
    }
    
    setUserAgent(navigator.userAgent);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('achievery-mobile-prompt-dismissed', 'true');
    onDismiss?.();
  };

  const handleDownload = (platform: 'ios' | 'android') => {
    // Track download attempt
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'mobile_app_download_attempt', {
        platform,
        source: 'web_prompt'
      });
    }

    // Deep link or app store redirect
    if (platform === 'ios') {
      // Try to open the app first, fallback to App Store
      window.location.href = 'achievery://open';
      setTimeout(() => {
        window.location.href = 'https://apps.apple.com/app/achievery/id[APP_ID]';
      }, 1000);
    } else {
      // Try to open the app first, fallback to Play Store
      window.location.href = 'achievery://open';
      setTimeout(() => {
        window.location.href = 'https://play.google.com/store/apps/details?id=com.stratanoble.achievery';
      }, 1000);
    }
  };

  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isAndroid = /Android/.test(userAgent);

  if (!isVisible) return null;

  const bannerContent = (
    <div className={`bg-gradient-to-r from-blue-600 to-green-600 text-white p-4 ${className}`}>
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center space-x-4">
          <Smartphone className="h-8 w-8 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-lg">Get the ACHIEVERY Mobile App</h3>
            <p className="text-blue-100 text-sm">Track your progress on-the-go with daily engagement tools</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {isIOS && (
            <button
              onClick={() => handleDownload('ios')}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center space-x-2"
            >
              <Apple className="h-4 w-4" />
              <span>App Store</span>
            </button>
          )}
          
          {isAndroid && (
            <button
              onClick={() => handleDownload('android')}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center space-x-2"
            >
              <PlayCircle className="h-4 w-4" />
              <span>Play Store</span>
            </button>
          )}
          
          {!isIOS && !isAndroid && (
            <div className="flex space-x-2">
              <button
                onClick={() => handleDownload('ios')}
                className="bg-white text-blue-600 px-3 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center space-x-1 text-sm"
              >
                <Apple className="h-4 w-4" />
                <span>iOS</span>
              </button>
              <button
                onClick={() => handleDownload('android')}
                className="bg-white text-blue-600 px-3 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center space-x-1 text-sm"
              >
                <PlayCircle className="h-4 w-4" />
                <span>Android</span>
              </button>
            </div>
          )}
          
          <button
            onClick={handleDismiss}
            className="text-white hover:text-blue-200 transition-colors p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );

  const inlineContent = (
    <div className={`bg-gradient-to-br from-blue-50 to-green-50 border border-blue-200 rounded-xl p-6 ${className}`}>
      <div className="flex items-start space-x-4">
        <div className="bg-gradient-to-br from-blue-500 to-green-500 p-3 rounded-xl">
          <Smartphone className="h-6 w-6 text-white" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg mb-2">
            Take ACHIEVERY with you everywhere
          </h3>
          <p className="text-gray-600 mb-4">
            Get the mobile app for daily progress tracking, streak maintenance, and on-the-go activity logging.
          </p>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleDownload('ios')}
              className="bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center space-x-2"
            >
              <Apple className="h-4 w-4" />
              <span>Download for iOS</span>
            </button>
            
            <button
              onClick={() => handleDownload('android')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <PlayCircle className="h-4 w-4" />
              <span>Get on Android</span>
            </button>
          </div>
          
          <div className="mt-3 text-sm text-gray-500">
            ✨ Same account, synchronized progress, enhanced mobile features
          </div>
        </div>
        
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  if (variant === 'inline') {
    return inlineContent;
  }

  return bannerContent;
};

// Smart App Banner component for iOS Safari
export const SmartAppBanner: React.FC = () => {
  useEffect(() => {
    // Add meta tag for iOS Smart App Banner
    const meta = document.createElement('meta');
    meta.name = 'apple-itunes-app';
    meta.content = 'app-id=[APP_ID], app-argument=achievery://dashboard';
    document.head.appendChild(meta);

    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  return null;
};

export default MobileAppPrompt;
