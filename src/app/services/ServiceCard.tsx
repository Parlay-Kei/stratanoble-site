"use client"

import React, { useRef } from 'react'

interface ServiceCardProps {
  title: string
  description: string
  icon: React.ReactNode
  ctaText: string
}

export function ServiceCard({
  title,
  description,
  icon,
  ctaText,
}: ServiceCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

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
  };

  return (
    <div
      className="relative group"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
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
          <div className="mb-5 p-3 inline-flex items-center justify-center rounded-lg bg-[#003366]/30 backdrop-bl-sm shadow shadow-[#00336633]">
            {icon}
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
          <p className="text-[#C0C0C0] mb-6">{description}</p>
          <button className="px-5 py-2.5 bg-[#50C878] hover:bg-[#3DB067] transition-colors text-white font-medium rounded-md flex items-center gap-2">
            {ctaText}
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
        </div>
      </div>
    </div>
  )
} 