'use client';

import Link from 'next/link';
import React, { useRef, useState } from 'react';

interface ServicePackage {
  name: string;
  price: string;
  features: string[];
}

interface ServiceCardProps {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  price?: string;
  whatYouGet: string[];
  packages?: ServicePackage[];
  ctaPrimary: string;
  ctaSecondary: string;
  calendlyLink: string;
  category: string;
  link: string;
}

export function ServiceCard({ 
  title, 
  subtitle, 
  description, 
  icon, 
  _price, 
  whatYouGet, 
  ctaPrimary,
  ctaSecondary,
  calendlyLink,
  category,
  link 
}: ServiceCardProps) {
  // const showPricing = process.env.NEXT_PUBLIC_SHOW_PRICING === 'true';
  const cardRef = useRef<HTMLDivElement>(null);
  const [showDetails, setShowDetails] = useState(false);

  // 3D tilt effect on mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const midX = rect.width / 2;
    const midY = rect.height / 2;
    const rotateX = ((y - midY) / midY) * 8; // intensity
    const rotateY = ((x - midX) / midX) * -8;
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.025)`;
    card.style.boxShadow = `0 20px 48px -8px #50C87833, 0 2px 24px 0 #00336633`;
  };

  // Reset tilt
  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = '';
    card.style.boxShadow = '';
    setShowDetails(false);
  };

  const handleMouseEnter = () => {
    setShowDetails(true);
  };

  // Handle Premium package payment - redirect to discovery page
  const handlePremiumPayment = () => {
    if (category !== 'strategy') return; // Only for Solution Services
    window.location.href = '/discovery';
  };

  return (
    <div 
      className="relative group" 
      onMouseMove={handleMouseMove} 
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
    >
      <div
        ref={cardRef}
        className={`
          relative rounded-2xl overflow-hidden transition-all duration-400
          bg-white/10 backdrop-blur-xl border border-white/20
          p-8 h-full cursor-pointer
          shadow-xl shadow-[#00336622]
        `}
        style={{
          // Subtle glassmorphism highlight
          background:
            'linear-gradient(135deg,rgba(80,200,120,0.07) 0%,rgba(192,192,192,0.09) 50%,rgba(255,255,255,0.08) 100%)',
        }}
      >
        {/* Glassy shine accent */}
        <div className="absolute left-0 top-0 w-1/2 h-2/3 bg-white/10 rounded-bl-2xl blur-2xl opacity-70 pointer-events-none"></div>
        {/* Color sweep on hover */}
        <div className="absolute right-0 bottom-0 w-1/2 h-1/2 bg-[#50C878]/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
        
        <div className="relative z-10">
          {/* Header */}
          <div className="mb-5 p-3 inline-flex items-center justify-center rounded-lg bg-[#003366]/30 backdrop-bl-sm shadow shadow-[#00336633]">
            {icon}
          </div>
          
          <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
          <p className="text-[#50C878] font-medium mb-3">{subtitle}</p>
          <p className="text-[#C0C0C0] mb-4 text-sm">{description}</p>
          
          {/* Removed pricing display - always show discovery call message */}
          <div className="mb-6 mt-4">
            <div className="text-[#50C878] font-medium text-sm">
              Schedule a discovery call for a tailored quote
            </div>
          </div>

          {/* What You Get - Show on hover */}
          <div className={`transition-all duration-300 ${showDetails ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0 overflow-hidden'}`}>
            <h4 className="text-white font-semibold mb-3">What You Get:</h4>
            <ul className="space-y-2 mb-6">
              {whatYouGet.map((item, index) => (
                <li key={index} className="flex items-start text-[#C0C0C0] text-sm">
                  <span className="text-[#50C878] mr-2 mt-1">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            {/* Primary CTA - Discovery Call for all, Payment for Premium */}
            {category === 'strategy' ? (
              <button
                onClick={handlePremiumPayment}
                className="w-full px-5 py-3 bg-[#50C878] hover:bg-[#3DB067] transition-colors text-white font-medium rounded-md flex items-center justify-center gap-2 text-sm"
              >
                {ctaPrimary}
                <svg
                  className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </button>
            ) : (
              <Link 
                href={calendlyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-5 py-3 bg-[#50C878] hover:bg-[#3DB067] transition-colors text-white font-medium rounded-md flex items-center justify-center gap-2 text-sm"
              >
                {ctaPrimary}
                <svg
                  className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </Link>
            )}
            
            <Link 
              href={link}
              className="w-full px-5 py-2.5 bg-transparent hover:bg-white/10 transition-colors text-white font-medium rounded-md border border-white/30 flex items-center justify-center gap-2 text-sm"
            >
              {ctaSecondary}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
