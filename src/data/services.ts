// ServiceCardGrid data for landing page - Updated for four core offerings
export const services = [
  {
    icon: '💡',
    title: 'Solution Services',
    subtitle: 'Strategy & Execution for Solo / Small Biz',
    description: 'Transform your vision into actionable strategy with proven frameworks and hands-on execution support.',
    link: '/services#solution-services',
    price: 'From $1,200', // Only displayed when NEXT_PUBLIC_SHOW_PRICING=true
    whatYouGet: [
      'Strategic business roadmap',
      'Market analysis & positioning',
      'Revenue model design',
      '90-day action plan',
    ],
    packages: [
      {
        name: 'Lite',
        price: '$1,200',
        features: ['2-hour strategy session', 'Business model canvas', '30-day action plan', 'Email support']
      },
      {
        name: 'Core',
        price: '$2,500',
        features: ['4-hour deep dive', 'Market analysis report', 'Revenue model design', '90-day roadmap', '2 follow-up calls']
      },
      {
        name: 'Premium',
        price: '$5,000',
        features: ['Full strategy & execution', 'Quarterly reviews', 'Priority support', 'Implementation guidance', 'Success metrics tracking']
      }
    ],
    ctaPrimary: 'Book Free Discovery',
    ctaSecondary: 'Download One-Pager',
    calendlyLink: 'https://calendly.com/stratanoble/discovery',
    category: 'strategy'
  },
  {
    icon: '🎓',
    title: 'Side-Hustle Workshops',
    subtitle: 'Hands-on learning for aspiring entrepreneurs',
    description: 'Join interactive workshops designed to help you launch and scale your side hustle with proven strategies.',
    link: '/services#workshops',
    price: 'From $97', // Only displayed when NEXT_PUBLIC_SHOW_PRICING=true
    whatYouGet: [
      'Live interactive sessions',
      'Take-home templates',
      'Q&A with experts',
      'Resource vault access',
      'Join Slack community for ongoing support',
    ],
    packages: [
      {
        name: 'Standard',
        price: '$97',
        features: ['Live workshop access', 'Recording access', 'Resource templates', 'Community access']
      },
      {
        name: 'VIP',
        price: '$197',
        features: ['All Standard features', '1-on-1 mentoring session', 'Priority Q&A', 'Exclusive resources', 'Lifetime access']
      }
    ],
    ctaPrimary: 'View Upcoming Workshops',
    ctaSecondary: 'Join Waitlist',
    calendlyLink: 'https://calendly.com/stratanoble/workshop',
    category: 'education'
  },
  {
    icon: '📊',
    title: 'Data & Operations Analysis',
    subtitle: 'Optimize your business with data-driven insights',
    description: 'Unlock hidden opportunities in your operations with comprehensive data analysis and actionable recommendations.',
    link: '/services#data-analysis',
    price: 'From $800', // Only displayed when NEXT_PUBLIC_SHOW_PRICING=true
    whatYouGet: [
      'KPI dashboard setup',
      'Data collection strategy',
      'Performance reports',
      'Optimization recommendations',
    ],
    packages: [
      {
        name: 'Analysis',
        price: '$800',
        features: ['Data audit', 'KPI identification', 'Performance report', 'Recommendations']
      },
      {
        name: 'Implementation',
        price: '$2,000',
        features: ['Full analysis', 'Dashboard setup', 'Process optimization', 'Team training', '30-day support']
      }
    ],
    ctaPrimary: 'Request Sample Analysis',
    ctaSecondary: 'View Case Studies',
    calendlyLink: 'https://calendly.com/stratanoble/data-analysis',
    category: 'analytics'
  },
  {
    icon: '🎨',
    title: 'Brand & Digital Presence',
    subtitle: 'Complete brand identity and digital strategy',
    description: 'Build a compelling brand identity and establish a strong digital presence that resonates with your audience.',
    link: '/services#brand-digital',
    price: 'From $1,500', // Only displayed when NEXT_PUBLIC_SHOW_PRICING=true
    whatYouGet: [
      'Brand identity design',
      'Website development',
      'Social media strategy',
      'Content creation',
    ],
    packages: [
      {
        name: 'Starter',
        price: '$1,500',
        features: ['Logo design', 'Brand guidelines', 'Basic website', 'Social media setup']
      },
      {
        name: 'Growth',
        price: '$3,500',
        features: ['Full brand identity', 'Custom website', 'Content strategy', 'Social media management', 'SEO optimization']
      },
      {
        name: 'Authority',
        price: '$7,500',
        features: ['Complete brand suite', 'Advanced website', 'Content creation', 'Marketing automation', 'Ongoing support']
      }
    ],
    ctaPrimary: 'Get Custom Quote',
    ctaSecondary: 'View Portfolio',
    calendlyLink: 'https://calendly.com/stratanoble/brand-consultation',
    category: 'branding'
  },
];

// Service categories for filtering
export const serviceCategories = [
  { id: 'all', name: 'All Services' },
  { id: 'strategy', name: 'Strategy & Consulting' },
  { id: 'education', name: 'Workshops & Training' },
  { id: 'analytics', name: 'Data & Analytics' },
  { id: 'branding', name: 'Brand & Digital' },
];
