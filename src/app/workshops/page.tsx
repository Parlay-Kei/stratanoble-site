'use client';

import { useState, useEffect } from 'react';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';

import { motion } from 'framer-motion';

interface Workshop {
  title: string;
  date: string;
  description: string;
  link: string;
  price: number;
  earlyBirdPrice: number;
  earlyBirdEndDate: string;
  maxAttendees: number;
  currentAttendees: number;
  category: string;
  instructor: string;
  duration: string;
  format: string;
}

// Enhanced workshop data
const enhancedWorkshops: Workshop[] = [
  {
    title: 'AI for Founders: Build Smarter, Faster',
    date: '2024-08-15',
    description: 'A hands-on workshop for first-time founders to leverage AI and no-code tools for rapid business validation and growth.',
    link: '/workshops/ai-for-founders',
    price: 147,
    earlyBirdPrice: 97,
    earlyBirdEndDate: '2024-07-15',
    maxAttendees: 25,
    currentAttendees: 12,
    category: 'AI & Technology',
    instructor: 'Steve Hubbard',
    duration: '3 hours',
    format: 'Live Online'
  },
  {
    title: 'Prompt Engineering Bootcamp',
    date: '2024-09-05',
    description: 'Master the art of prompt engineering to get the most out of ChatGPT and other LLMs in your workflow. Includes live demos and take-home templates.',
    link: '/workshops/prompt-bootcamp',
    price: 197,
    earlyBirdPrice: 147,
    earlyBirdEndDate: '2024-08-05',
    maxAttendees: 20,
    currentAttendees: 8,
    category: 'AI & Technology',
    instructor: 'Steve Hubbard',
    duration: '4 hours',
    format: 'Live Online'
  },
  {
    title: 'No-Code Automation for Startups',
    date: '2024-09-20',
    description: 'Learn to automate your business processes using no-code AI tools. Save time, reduce costs, and scale smarter. Includes Q&A with automation experts.',
    link: '/workshops/no-code-automation',
    price: 167,
    earlyBirdPrice: 127,
    earlyBirdEndDate: '2024-08-20',
    maxAttendees: 30,
    currentAttendees: 15,
    category: 'Automation',
    instructor: 'Steve Hubbard',
    duration: '3.5 hours',
    format: 'Live Online'
  },
  {
    title: 'AI Strategy Deep Dive: 2025 Trends',
    date: '2025-01-15',
    description: 'A forward-looking session on the next wave of AI tools and strategies for founders and operators. Early registration recommended.',
    link: '/workshops/ai-strategy-2025',
    price: 247,
    earlyBirdPrice: 197,
    earlyBirdEndDate: '2024-12-15',
    maxAttendees: 15,
    currentAttendees: 3,
    category: 'Strategy',
    instructor: 'Steve Hubbard',
    duration: '5 hours',
    format: 'Live Online'
  }
];

function CountdownTimer({ endDate }: { endDate: string }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(endDate).getTime();
      const difference = end - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  return (
    <div className="flex gap-2 text-sm">
      <div className="bg-[#50C878] text-white px-2 py-1 rounded">
        {timeLeft.days}d
      </div>
      <div className="bg-[#50C878] text-white px-2 py-1 rounded">
        {timeLeft.hours}h
      </div>
      <div className="bg-[#50C878] text-white px-2 py-1 rounded">
        {timeLeft.minutes}m
      </div>
      <div className="bg-[#50C878] text-white px-2 py-1 rounded">
        {timeLeft.seconds}s
      </div>
    </div>
  );
}

function WorkshopCard({ workshop }: { workshop: Workshop }) {
  const isEarlyBird = new Date() < new Date(workshop.earlyBirdEndDate);
  const currentPrice = isEarlyBird ? workshop.earlyBirdPrice : workshop.price;
  const spotsLeft = workshop.maxAttendees - workshop.currentAttendees;
  const isSoldOut = spotsLeft <= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">{workshop.title}</h3>
          <p className="text-[#50C878] text-sm">{workshop.category}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">${currentPrice}</div>
          {isEarlyBird && (
            <div className="text-sm text-[#C0C0C0] line-through">${workshop.price}</div>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-[#C0C0C0] mb-4 text-sm">{workshop.description}</p>

      {/* Details */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <span className="text-[#50C878]">Date:</span>
          <div className="text-white">{new Date(workshop.date).toLocaleDateString()}</div>
        </div>
        <div>
          <span className="text-[#50C878]">Duration:</span>
          <div className="text-white">{workshop.duration}</div>
        </div>
        <div>
          <span className="text-[#50C878]">Format:</span>
          <div className="text-white">{workshop.format}</div>
        </div>
        <div>
          <span className="text-[#50C878]">Instructor:</span>
          <div className="text-white">{workshop.instructor}</div>
        </div>
      </div>

      {/* Early Bird Timer */}
      {isEarlyBird && (
        <div className="mb-4 p-3 bg-[#50C878]/20 rounded-lg">
          <div className="text-[#50C878] font-semibold text-sm mb-2">Early Bird Pricing Ends In:</div>
          <CountdownTimer endDate={workshop.earlyBirdEndDate} />
        </div>
      )}

      {/* Spots Left */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-[#C0C0C0]">Spots Available:</span>
          <span className="text-white">{spotsLeft} of {workshop.maxAttendees}</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-2">
          <div 
            className="bg-[#50C878] h-2 rounded-full transition-all duration-300"
            style={{ width: `${(workshop.currentAttendees / workshop.maxAttendees) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* CTA Button */}
      <button
        disabled={isSoldOut}
        className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
          isSoldOut
            ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
            : 'bg-[#50C878] hover:bg-[#3DB067] text-white'
        }`}
      >
        {isSoldOut ? 'Sold Out' : `Register Now - $${currentPrice}`}
      </button>
    </motion.div>
  );
}

export default function WorkshopsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#003366] via-[#004080] to-[#002244]">
      <Header />
      <div className="py-24 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Side-Hustle Workshops
            </h1>
            <p className="mt-6 text-lg leading-8 text-[#C0C0C0]">
              Hands-on learning experiences designed to help you launch and scale your business
            </p>
          </div>

          {/* Workshops Grid */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
            {enhancedWorkshops.map((workshop, index) => (
              <WorkshopCard key={index} workshop={workshop} />
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <p className="text-[#C0C0C0] mb-6">
              Don&apos;t see what you&apos;re looking for? Let us know what topics interest you!
            </p>
            <button className="px-8 py-3 bg-transparent hover:bg-white/10 transition-colors text-white font-medium rounded-md border border-white/30">
              Suggest a Workshop Topic
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
} 