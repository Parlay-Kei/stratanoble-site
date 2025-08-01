'use client';

import Image from 'next/image';

interface FounderCardProps {
  name: string;
  title: string;
  headshot: string;
  children: React.ReactNode;
}

export function FounderCard({ name, title, headshot, children }: FounderCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow max-w-4xl mx-auto">
      <div className="md:flex">
        <div className="md:w-1/3">
          <div className="aspect-square bg-gradient-to-br from-navy-100 to-emerald-100 flex items-center justify-center">
            <Image
              src={headshot}
              alt={`${name}, ${title}`}
              width={400}
              height={400}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to placeholder if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = '<div class="text-6xl text-navy-300" aria-label="Person placeholder icon">👤</div>';
                }
              }}
            />
          </div>
        </div>
        <div className="md:w-2/3 p-8">
          <h3 className="text-2xl font-semibold text-navy-900 mb-2">{name}</h3>
          <p className="text-emerald-600 font-medium mb-6 text-lg">{title}</p>
          <div className="text-navy-600 leading-relaxed prose prose-lg max-w-none">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
