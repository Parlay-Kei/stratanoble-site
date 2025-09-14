'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, Globe, ArrowRight, Download, Zap, Target, TrendingUp } from 'lucide-react';
import { MobileAppPrompt } from './MobileAppPrompt';

interface CrossPlatformIntegrationProps {
  userTier?: 'lite' | 'growth' | 'partner';
  hasCompletedOnboarding?: boolean;
  totalActions?: number;
}

export const CrossPlatformIntegration: React.FC<CrossPlatformIntegrationProps> = ({
  userTier = 'lite',
  hasCompletedOnboarding = false,
  totalActions = 0
}) => {
  const [showMobilePrompt, setShowMobilePrompt] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobile(checkMobile);
    
    // Show mobile prompt after user has completed some actions
    if (totalActions >= 3 && hasCompletedOnboarding && !checkMobile) {
      setShowMobilePrompt(true);
    }
  }, [totalActions, hasCompletedOnboarding]);

  const platformFeatures = {
    web: [
      { icon: Target, text: 'Strategic Planning & Goal Setting', status: 'active' },
      { icon: TrendingUp, text: 'Comprehensive Analytics & Reports', status: 'active' },
      { icon: Globe, text: 'Strata Noble Service Integration', status: 'active' },
      { icon: Zap, text: 'AI-Powered Weekly Narratives', status: 'active' }
    ],
    mobile: [
      { icon: Smartphone, text: 'Daily Progress Tracking', status: 'available' },
      { icon: Target, text: 'Streak Maintenance & Reminders', status: 'available' },
      { icon: Zap, text: 'Quick Activity Logging', status: 'available' },
      { icon: TrendingUp, text: 'On-the-go Progress Checking', status: 'available' }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Mobile App Prompt */}
      {showMobilePrompt && (
        <MobileAppPrompt 
          variant="inline" 
          onDismiss={() => setShowMobilePrompt(false)}
        />
      )}

      {/* Platform Comparison */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Your ACHIEVERY Ecosystem
          </h2>
          <p className="text-gray-600">
            Seamlessly switch between web and mobile for the complete experience
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Web Platform */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gradient-to-br from-green-500 to-blue-500 p-2 rounded-lg">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900">Web Platform</h3>
                <p className="text-sm text-gray-600">Strategic planning & analysis</p>
              </div>
            </div>

            <div className="space-y-3">
              {platformFeatures.web.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <IconComponent className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700 font-medium">{feature.text}</span>
                    <div className="ml-auto">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile Platform */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-2 rounded-lg">
                <Smartphone className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900">Mobile App</h3>
                <p className="text-sm text-gray-600">Daily engagement & tracking</p>
              </div>
            </div>

            <div className="space-y-3">
              {platformFeatures.mobile.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <IconComponent className="h-5 w-5 text-blue-600" />
                    <span className="text-gray-700 font-medium">{feature.text}</span>
                    <div className="ml-auto">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Available
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {!isMobile && (
              <div className="mt-4 p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Ready to go mobile?</h4>
                    <p className="text-sm text-blue-100">Download the app for daily tracking</p>
                  </div>
                  <Download className="h-6 w-6" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Integration Flow */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            How They Work Together
          </h3>
          
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-green-600" />
              <span>Plan & Analyze</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <div className="flex items-center space-x-2">
              <Smartphone className="h-4 w-4 text-blue-600" />
              <span>Track Daily</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <span>Measure Growth</span>
            </div>
          </div>
        </div>
      </div>

      {/* Strata Noble Services Integration */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200 p-6">
        <div className="flex items-start space-x-4">
          <div className="bg-gradient-to-br from-gray-700 to-blue-700 p-3 rounded-xl">
            <Globe className="h-6 w-6 text-white" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg mb-2">
              Ready for Advanced Coaching?
            </h3>
            <p className="text-gray-600 mb-4">
              Your ACHIEVERY progress data helps our consultants provide personalized strategic guidance.
            </p>
            
            <div className="flex flex-wrap gap-3">
              <a
                href="/consultation"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <span>Book Consultation</span>
                <ArrowRight className="h-4 w-4" />
              </a>
              
              <a
                href="/resources"
                className="bg-white text-blue-600 border border-blue-200 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                Explore Resources
              </a>
            </div>
            
            <div className="mt-3 text-sm text-gray-500">
              💡 Your {totalActions} completed actions show strong momentum for growth
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrossPlatformIntegration;
