'use client';

import { useEffect, useRef, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Script from 'next/script';
import { motion, AnimatePresence } from 'framer-motion';

interface CalendlyModalProps {
  url: string;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export function CalendlyModal({ url, isOpen, onClose, title = "Schedule a Call" }: CalendlyModalProps) {
  const calendlyRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (isOpen && scriptLoaded && window.Calendly && calendlyRef.current) {
      // Clear previous content
      calendlyRef.current.innerHTML = '';
      
      window.Calendly.initInlineWidget({
        url: url,
        parentElement: calendlyRef.current,
        minWidth: 320,
        hideGdprBanner: true,
      });
    }
  }, [isOpen, scriptLoaded, url]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="lazyOnload"
        onLoad={() => setScriptLoaded(true)}
      />
      
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={onClose}
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Close modal"
                >
                  <XMarkIcon className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              
              {/* Calendly Widget */}
              <div className="h-[600px] overflow-auto">
                <div 
                  ref={calendlyRef}
                  className="w-full h-full"
                  data-url={url}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

// Hook for managing modal state
export function useCalendlyModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [modalUrl, setModalUrl] = useState('');
  const [modalTitle, setModalTitle] = useState('');

  const openModal = (url: string, title?: string) => {
    setModalUrl(url);
    setModalTitle(title || 'Schedule a Call');
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setModalUrl('');
    setModalTitle('');
  };

  return {
    isOpen,
    modalUrl,
    modalTitle,
    openModal,
    closeModal,
  };
}

// Extend Window interface for Calendly
declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (options: {
        url: string;
        parentElement: HTMLElement;
        minWidth?: number;
        hideGdprBanner?: boolean;
      }) => void;
    };
  }
}