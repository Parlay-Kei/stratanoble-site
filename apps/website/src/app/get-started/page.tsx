'use client';
export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  CheckCircleIcon, 
  LightBulbIcon, 
  ExclamationTriangleIcon,
  ArrowRightIcon,
  ChartBarIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface AnalysisData {
  marketSize: string;
  competition: string;
  opportunity: string;
  targetCustomer: string;
  priceRange: string;
  startupCosts: string;
  timeToFirstSale: string;
  viabilityScore: number;
  quickWins: string[];
  challenges: string[];
  nextSteps: string[];
}

function GetStartedInner() {
  const searchParams = useSearchParams();
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [idea, setIdea] = useState('');

  useEffect(() => {
    try {
      const storedAnalysis = sessionStorage.getItem('ideaAnalysis');
      const storedIdea = sessionStorage.getItem('userIdea');
      if (storedAnalysis) {
        setAnalysis(JSON.parse(storedAnalysis));
        setIdea(storedIdea || '');
      }
    } catch {}
    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#003366] via-[#004080] to-[#002244] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#50C878]"></div>
          <p className="mt-4 text-white text-lg">Analyzing your idea with AI...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#003366] via-[#004080] to-[#002244] flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <ExclamationTriangleIcon className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">No Analysis Found</h1>
          <p className="text-[#C0C0C0] mb-6">
            Please submit your idea from the homepage to get started.
          </p>
          <a 
            href="/"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#50C878] to-[#40B068] text-white font-bold px-6 py-3 rounded-full hover:shadow-lg transition-all"
          >
            Go to Homepage
            <ArrowRightIcon className="h-5 w-5" />
          </a>
        </div>
      </div>
    );
  }

  const scoreColor = analysis.viabilityScore >= 70 ? 'text-[#50C878]' : 
                     analysis.viabilityScore >= 50 ? 'text-yellow-400' : 'text-red-400';
  
  const scoreLabel = analysis.viabilityScore >= 70 ? 'Strong Potential' :
                     analysis.viabilityScore >= 50 ? 'Moderate Potential' : 'Needs Work';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#003366] via-[#004080] to-[#002244]">
      <div className="max-w-5xl mx-auto px-4 py-12">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#50C878]/10 border border-[#50C878]/30 rounded-full px-4 py-2 mb-6">
            <CheckCircleIcon className="h-5 w-5 text-[#50C878]" />
            <span className="text-[#50C878] font-semibold">AI Analysis Complete</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Your Business Idea Analysis
          </h1>
          
          <p className="text-xl text-[#C0C0C0] mb-6">
            "{idea}"
          </p>

          {/* Viability Score */}
          <div className="inline-block bg-[#001122] border border-white/10 rounded-2xl p-6 mb-8">
            <div className="text-center">
              <div className={`text-6xl font-bold ${scoreColor} mb-2`}>
                {analysis.viabilityScore}
              </div>
              <div className="text-[#C0C0C0] text-sm uppercase tracking-wide">
                Viability Score
              </div>
              <div className={`${scoreColor} font-semibold mt-2`}>
                {scoreLabel}
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {[
            { icon: ChartBarIcon, label: 'Market Size', value: analysis.marketSize },
            { icon: UsersIcon, label: 'Target Customer', value: analysis.targetCustomer },
            { icon: CurrencyDollarIcon, label: 'Price Range', value: analysis.priceRange },
            { icon: ClockIcon, label: 'Time to First Sale', value: analysis.timeToFirstSale },
          ].map((metric, idx) => (
            <div key={idx} className="bg-[#001122] border border-white/10 rounded-xl p-4">
              <metric.icon className="h-8 w-8 text-[#50C878] mb-2" />
              <div className="text-xs text-[#C0C0C0] uppercase tracking-wide mb-1">
                {metric.label}
              </div>
              <div className="text-white font-semibold">
                {metric.value}
              </div>
            </div>
          ))}
        </div>

        {/* Analysis Sections */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          
          {/* Competition */}
          <div className="bg-[#001122] border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <ChartBarIcon className="h-6 w-6 text-[#50C878]" />
              Competition Level
            </h3>
            <p className="text-[#C0C0C0]">{analysis.competition}</p>
          </div>

          {/* Opportunity */}
          <div className="bg-[#001122] border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <LightBulbIcon className="h-6 w-6 text-[#50C878]" />
              Key Opportunity
            </h3>
            <p className="text-[#C0C0C0]">{analysis.opportunity}</p>
          </div>

          {/* Startup Costs */}
          <div className="bg-[#001122] border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <CurrencyDollarIcon className="h-6 w-6 text-[#50C878]" />
              Estimated Startup Costs
            </h3>
            <p className="text-2xl font-bold text-white mb-2">{analysis.startupCosts}</p>
            <p className="text-sm text-[#C0C0C0]">Initial investment needed to launch</p>
          </div>

          {/* Time to Launch */}
          <div className="bg-[#001122] border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <ClockIcon className="h-6 w-6 text-[#50C878]" />
              Launch Timeline
            </h3>
            <p className="text-2xl font-bold text-white mb-2">{analysis.timeToFirstSale}</p>
            <p className="text-sm text-[#C0C0C0]">From start to first sale</p>
          </div>
        </div>

        {/* Quick Wins */}
        <div className="bg-gradient-to-br from-[#50C878]/10 to-[#40B068]/5 border border-[#50C878]/30 rounded-xl p-6 mb-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <CheckCircleIcon className="h-6 w-6 text-[#50C878]" />
            Quick Wins - Start Here
          </h3>
          <ul className="space-y-3">
            {analysis.quickWins.map((win, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <CheckCircleIcon className="h-6 w-6 text-[#50C878] flex-shrink-0 mt-0.5" />
                <span className="text-white">{win}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Challenges */}
        <div className="bg-[#001122] border border-yellow-400/30 rounded-xl p-6 mb-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" />
            Challenges to Prepare For
          </h3>
          <ul className="space-y-3">
            {analysis.challenges.map((challenge, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400 flex-shrink-0 mt-0.5" />
                <span className="text-[#C0C0C0]">{challenge}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-br from-[#003366] to-[#004080] border border-[#50C878]/30 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            Ready to Build This Business?
          </h3>
          <p className="text-[#C0C0C0] mb-6 max-w-2xl mx-auto">
            Create a free account to get your complete 30-day roadmap, AI-powered tools, 
            and step-by-step guidance to turn this idea into reality.
          </p>
          
          <div className="space-y-3 mb-8">
            {analysis.nextSteps.map((step, idx) => (
              <div key={idx} className="flex items-center justify-center gap-3 text-white">
                <ArrowRightIcon className="h-5 w-5 text-[#50C878]" />
                <span>{step}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/auth/signup"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#50C878] to-[#40B068] text-white font-bold px-8 py-4 rounded-full hover:shadow-lg transition-all"
            >
              Create Free Account
              <ArrowRightIcon className="h-5 w-5" />
            </a>
            <a
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white font-bold px-8 py-4 rounded-full hover:bg-white/20 transition-all"
            >
              View Pricing Plans
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
export default function GetStartedPage() {
  return (
    <Suspense fallback={null}>
      <GetStartedInner />
    </Suspense>
  );
}

