'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

interface NoupeChatProps {
  showDisclosure?: boolean;
  loadDelay?: number;
}

const NOUPE_BOT_ID = '019bee4df58e7b3f98aa9a6fb06b20f08f9f';
const NOUPE_EMBED_URL = `https://www.jotform.com/agent/${NOUPE_BOT_ID}`;

export default function NoupeChat({
  showDisclosure = true,
  loadDelay: _loadDelay
}: NoupeChatProps) {
  void _loadDelay;
  const [shouldLoad, setShouldLoad] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('noupe-chat-consent') === 'true') {
      setShouldLoad(true);
      return;
    }

    let triggered = false;

    const trigger = () => {
      if (triggered) return;
      triggered = true;
      setShouldLoad(true);
      window.removeEventListener('scroll', trigger);
      clearTimeout(idleTimer);
    };

    const idleTimer = setTimeout(trigger, 15000);
    window.addEventListener('scroll', trigger, { passive: true });

    return () => {
      window.removeEventListener('scroll', trigger);
      clearTimeout(idleTimer);
    };
  }, []);

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

  const handleDismiss = () => {
    setShouldLoad(false);
  };

  const toggleChat = () => {
    if (!hasConsented && showDisclosure) {
      return;
    }
    setIsVisible(!isVisible);
  };

  if (!shouldLoad) {
    return null;
  }

  return (
    <>
      {showDisclosure && !hasConsented && (
        <div
          className="fixed bottom-20 right-4 z-50 max-w-sm bg-white rounded-lg shadow-xl border border-slate-grey/25 p-4"
          role="dialog"
          aria-labelledby="chat-disclosure-title"
        >
          <div className="flex items-start justify-between mb-2">
            <h3 id="chat-disclosure-title" className="font-semibold text-gray-900">
              Chat with us
            </h3>
            <button
              onClick={handleDismiss}
              className="ml-3 text-slate-grey hover:text-gray-700 transition-colors text-lg leading-none"
              aria-label="Dismiss chat"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            This chat is powered by Noupe (Jotform). Please do not submit sensitive
            personal information. Conversation content may be transmitted to a
            third-party service and delivered to Strata Noble via email.
          </p>
          <button
            onClick={handleConsent}
            className="w-full bg-forest-green text-white text-sm py-2 px-4 rounded-md hover:bg-forest-green transition-colors"
          >
            I understand, start chat
          </button>
          <a
            href="/privacy"
            className="block text-xs text-slate-grey mt-2 hover:text-forest-green"
          >
            View our Privacy Policy
          </a>
        </div>
      )}

      {hasConsented && (
        <button
          onClick={toggleChat}
          className="fixed bottom-4 right-4 z-50 w-14 h-14 bg-forest-green rounded-full shadow-lg hover:bg-forest-green transition-colors flex items-center justify-center"
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
