'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

/**
 * NoupeChat Component
 *
 * Lazy-loaded Noupe/Jotform chatbot widget with privacy disclosure.
 *
 * Bot ID: 019bee4df58e7b3f98aa9a6fb06b20f08f9f
 * Provider: Noupe (Jotform)
 *
 * Security considerations:
 * - Lazy-loaded to avoid blocking critical rendering path
 * - CSP allowlist required for: *.jotform.com, *.noupe.com
 * - Data transmitted to third-party (Jotform servers)
 * - Conversations delivered to Strata Noble via email
 *
 * @see CSP configuration in next.config.js
 */

interface NoupeChatProps {
  /** Show privacy disclosure before loading widget */
  showDisclosure?: boolean;
  /** Delay in ms before loading widget (default: 3000) */
  loadDelay?: number;
}

const NOUPE_BOT_ID = '019bee4df58e7b3f98aa9a6fb06b20f08f9f';
const NOUPE_EMBED_URL = `https://www.jotform.com/agent/${NOUPE_BOT_ID}`;

export default function NoupeChat({
  showDisclosure = true,
  loadDelay = 3000
}: NoupeChatProps) {
  const [shouldLoad, setShouldLoad] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Lazy load: wait for page to be interactive before loading widget
  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldLoad(true);
    }, loadDelay);

    return () => clearTimeout(timer);
  }, [loadDelay]);

  // Check for prior consent in localStorage
  useEffect(() => {
    const consent = localStorage.getItem('noupe-chat-consent');
    if (consent === 'true') {
      setHasConsented(true);
    }
  }, []);

  const handleConsent = () => {
    localStorage.setItem('noupe-chat-consent', 'true');
    setHasConsented(true);
    setIsVisible(true);
  };

  const toggleChat = () => {
    if (!hasConsented && showDisclosure) {
      // Show disclosure first
      return;
    }
    setIsVisible(!isVisible);
  };

  // Don't render anything until ready to load
  if (!shouldLoad) {
    return null;
  }

  return (
    <>
      {/* Disclosure overlay for first-time users */}
      {showDisclosure && !hasConsented && (
        <div
          className="fixed bottom-20 right-4 z-50 max-w-sm bg-white rounded-lg shadow-xl border border-gray-200 p-4"
          role="dialog"
          aria-labelledby="chat-disclosure-title"
        >
          <h3 id="chat-disclosure-title" className="font-semibold text-gray-900 mb-2">
            Chat with us
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            This chat is powered by Noupe (Jotform). Please do not submit sensitive
            personal information. Conversation content may be transmitted to a
            third-party service and delivered to Strata Noble via email.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleConsent}
              className="flex-1 bg-emerald-600 text-white text-sm py-2 px-4 rounded-md hover:bg-emerald-700 transition-colors"
            >
              I understand, start chat
            </button>
          </div>
          <a
            href="/privacy"
            className="block text-xs text-gray-500 mt-2 hover:text-emerald-600"
          >
            View our Privacy Policy
          </a>
        </div>
      )}

      {/* Chat toggle button */}
      {hasConsented && (
        <button
          onClick={toggleChat}
          className="fixed bottom-4 right-4 z-50 w-14 h-14 bg-emerald-600 rounded-full shadow-lg hover:bg-emerald-700 transition-colors flex items-center justify-center"
          aria-label={isVisible ? 'Close chat' : 'Open chat'}
        >
          {isVisible ? (
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          )}
        </button>
      )}

      {/* Noupe chat iframe - only rendered after consent */}
      {hasConsented && isVisible && (
        <div
          className="fixed bottom-20 right-4 z-50 w-96 h-[500px] bg-white rounded-lg shadow-xl overflow-hidden"
          role="dialog"
          aria-label="Chat window"
        >
          <iframe
            src={NOUPE_EMBED_URL}
            title="Strata Noble Chat"
            className="w-full h-full border-0"
            loading="lazy"
            allow="microphone"
          />
        </div>
      )}

      {/* Jotform script for enhanced features (loaded after consent) */}
      {hasConsented && (
        <Script
          id="jotform-agent"
          src="https://cdn.jotfor.ms/js/vendor/smoothscroll.min.js"
          strategy="lazyOnload"
        />
      )}
    </>
  );
}
