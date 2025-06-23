import { motion, AnimatePresence } from 'framer-motion';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Container, AnimatedText } from '@/lib/ui';
import { cn } from '@/lib/ui-utils';

// Tab Components
import { AILiteracyTab } from '@/components/ai-services/AILiteracyTab';
import { AIContentTab } from '@/components/ai-services/AIContentTab';
import { AIAutomationTab } from '@/components/ai-services/AIAutomationTab';
import { AIMonetizationTab } from '@/components/ai-services/AIMonetizationTab';
import { AcceleratorTab } from '@/components/ai-services/AcceleratorTab';
import { SupportTab } from '@/components/ai-services/SupportTab';

const tabs = [
  {
    id: 'literacy',
    label: 'AI Literacy & Foundations',
    path: '/ai-services/literacy',
    component: AILiteracyTab,
  },
  {
    id: 'content',
    label: 'AI Content & Creative',
    path: '/ai-services/content',
    component: AIContentTab,
  },
  {
    id: 'automation',
    label: 'AI Automation & Operations',
    path: '/ai-services/automation',
    component: AIAutomationTab,
  },
  {
    id: 'monetization',
    label: 'AI Monetization Strategy',
    path: '/ai-services/monetization',
    component: AIMonetizationTab,
  },
  {
    id: 'accelerator',
    label: 'Passion → Prosperity Accelerator',
    path: '/ai-services/accelerator',
    component: AcceleratorTab,
  },
  {
    id: 'support',
    label: 'Ongoing Support',
    path: '/ai-services/support',
    component: SupportTab,
  },
];

export const AIServicesPage = () => {
  const location = useLocation();
  const currentTab = tabs.find((tab) => location.pathname.includes(tab.id)) || tabs[0];

  return (
    <div className="min-h-screen pt-20 bg-background">
      <Container className="py-12">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <AnimatedText
            as="h1"
            className="font-headings text-4xl md:text-5xl font-bold mb-6 text-primary"
          >
            AI for Passionate Creators
          </AnimatedText>
          <AnimatedText as="p" className="text-xl text-primary/80 leading-relaxed">
            Transform your creative passion into a thriving business with our AI-powered solutions
          </AnimatedText>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-primary/10 mb-8">
          <nav className="flex flex-wrap gap-2 md:gap-4 justify-center">
            {tabs.map((tab) => (
              <motion.div key={tab.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to={tab.path}
                  className={cn(
                    'px-4 py-2 text-sm md:text-base font-medium rounded-lg transition-colors',
                    currentTab.id === tab.id
                      ? 'bg-accent text-white'
                      : 'text-primary/80 hover:bg-primary/5'
                  )}
                >
                  {tab.label}
                </Link>
              </motion.div>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Routes>
              {tabs.map((tab) => (
                <Route key={tab.id} path={`/${tab.id}`} element={<tab.component />} />
              ))}
              <Route path="/" element={<Navigate to={tabs[0].path} replace />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </Container>
    </div>
  );
};
