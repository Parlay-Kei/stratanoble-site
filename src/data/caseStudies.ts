export interface CaseStudy {
  id: string;
  title: string;
  subtitle: string;
  client: string;
  industry: string;
  duration: string;
  problem: string;
  approach: string;
  outcome: string;
  kpis: {
    metric: string;
    before: string;
    after: string;
    improvement: string;
  }[];
  pullQuote: string;
  pullQuoteAuthor: string;
  pullQuoteRole: string;
  services: string[];
  image: string;
  featured: boolean;
}

export const caseStudies: CaseStudy[] = [
  {
    id: 'ecommerce-transformation',
    title: 'E-commerce Transformation',
    subtitle: 'How we helped a mid-market retailer increase online revenue by 340%',
    client: 'TechStyle Retail',
    industry: 'E-commerce & Retail',
    duration: '6 months',
    problem: 'TechStyle Retail was struggling with declining online sales, poor customer retention, and an outdated digital strategy. Their website was difficult to navigate, mobile experience was poor, and they had no data-driven approach to customer acquisition or retention. Monthly online revenue had plateaued at $45,000, and customer acquisition costs were skyrocketing.',
    approach: 'We implemented a comprehensive digital transformation strategy that included: 1) Complete website redesign with mobile-first approach, 2) Advanced analytics implementation to track customer behavior, 3) Personalized marketing automation system, 4) A/B testing framework for continuous optimization, 5) Customer journey mapping and optimization, 6) Integration of AI-powered product recommendations.',
    outcome: 'The transformation resulted in dramatic improvements across all key metrics. Online revenue increased by 340%, customer lifetime value improved by 180%, and customer acquisition costs decreased by 45%. The new data-driven approach enabled continuous optimization, leading to sustained growth month over month.',
    kpis: [
      {
        metric: 'Monthly Online Revenue',
        before: '$45,000',
        after: '$198,000',
        improvement: '+340%'
      },
      {
        metric: 'Customer Lifetime Value',
        before: '$120',
        after: '$336',
        improvement: '+180%'
      },
      {
        metric: 'Customer Acquisition Cost',
        before: '$85',
        after: '$47',
        improvement: '-45%'
      },
      {
        metric: 'Mobile Conversion Rate',
        before: '1.2%',
        after: '4.8%',
        improvement: '+300%'
      }
    ],
    pullQuote: 'Strata Noble didn\'t just redesign our website - they transformed our entire digital strategy. The results speak for themselves.',
    pullQuoteAuthor: 'Jennifer Martinez',
    pullQuoteRole: 'CEO, TechStyle Retail',
    services: ['Digital Strategy', 'E-commerce Optimization', 'Data Analytics'],
    image: '/img/case-studies/ecommerce-transformation.jpg',
    featured: true
  },
  {
    id: 'startup-scaling',
    title: 'Startup Scaling Strategy',
    subtitle: 'From $500K to $5M ARR in 18 months through strategic growth',
    client: 'InnovateTech Solutions',
    industry: 'SaaS & Technology',
    duration: '18 months',
    problem: 'InnovateTech had a solid product with $500K ARR but was struggling to scale efficiently. They were burning through cash on ineffective marketing campaigns, had no clear go-to-market strategy, and their sales process was inconsistent. Customer churn was high at 15% monthly, and they were losing deals to larger competitors despite having superior technology.',
    approach: 'We developed a comprehensive scaling strategy that included: 1) Market positioning analysis and competitive differentiation, 2) Customer segmentation and persona development, 3) Optimized sales process with clear qualification criteria, 4) Content marketing strategy to build thought leadership, 5) Customer success program to reduce churn, 6) Strategic partnerships and channel development, 7) Data-driven growth experiments.',
    outcome: 'The strategic approach led to explosive growth, reaching $5M ARR within 18 months. Customer churn decreased from 15% to 3% monthly, and the company secured Series A funding of $8M. The new positioning helped them win against larger competitors, and the customer success program created strong advocates for the product.',
    kpis: [
      {
        metric: 'Annual Recurring Revenue',
        before: '$500,000',
        after: '$5,000,000',
        improvement: '+900%'
      },
      {
        metric: 'Monthly Customer Churn',
        before: '15%',
        after: '3%',
        improvement: '-80%'
      },
      {
        metric: 'Customer Acquisition Cost',
        before: '$2,400',
        after: '$1,200',
        improvement: '-50%'
      },
      {
        metric: 'Average Deal Size',
        before: '$8,000',
        after: '$25,000',
        improvement: '+213%'
      }
    ],
    pullQuote: 'Strata Noble\'s strategic guidance was the catalyst that transformed us from a struggling startup into a market leader.',
    pullQuoteAuthor: 'David Chen',
    pullQuoteRole: 'Founder & CEO, InnovateTech Solutions',
    services: ['Growth Strategy', 'Market Positioning', 'Sales Optimization'],
    image: '/img/case-studies/startup-scaling.jpg',
    featured: true
  },
  {
    id: 'manufacturing-efficiency',
    title: 'Manufacturing Efficiency Revolution',
    subtitle: 'Reducing operational costs by 35% through data-driven optimization',
    client: 'Precision Manufacturing Co.',
    industry: 'Manufacturing & Industrial',
    duration: '12 months',
    problem: 'Precision Manufacturing was facing increasing pressure from overseas competition and rising operational costs. Their production processes were inefficient, with 25% waste in materials and 30% downtime due to equipment failures. Quality control was inconsistent, leading to high return rates and customer dissatisfaction. They needed to modernize their operations while maintaining quality standards.',
    approach: 'We implemented a comprehensive operational transformation that included: 1) IoT sensor deployment for real-time equipment monitoring, 2) Predictive maintenance system to reduce downtime, 3) Advanced analytics for process optimization, 4) Quality control automation and standardization, 5) Supply chain optimization and vendor management, 6) Employee training program for new technologies, 7) Performance dashboard for real-time decision making.',
    outcome: 'The transformation resulted in significant operational improvements across all metrics. Operational costs decreased by 35%, equipment downtime was reduced by 70%, and quality defects decreased by 60%. The company regained competitive advantage and increased market share by 25%.',
    kpis: [
      {
        metric: 'Operational Costs',
        before: '$2.8M annually',
        after: '$1.8M annually',
        improvement: '-35%'
      },
      {
        metric: 'Equipment Downtime',
        before: '30%',
        after: '9%',
        improvement: '-70%'
      },
      {
        metric: 'Quality Defects',
        before: '8%',
        after: '3.2%',
        improvement: '-60%'
      },
      {
        metric: 'Production Efficiency',
        before: '65%',
        after: '88%',
        improvement: '+35%'
      }
    ],
    pullQuote: 'The data-driven approach Strata Noble implemented transformed our entire operation. We\'re now more efficient than ever.',
    pullQuoteAuthor: 'Michael Rodriguez',
    pullQuoteRole: 'Operations Director, Precision Manufacturing Co.',
    services: ['Operational Excellence', 'Data Analytics', 'Process Optimization'],
    image: '/img/case-studies/manufacturing-efficiency.jpg',
    featured: false
  }
];

export const getFeaturedCaseStudies = () => caseStudies.filter(cs => cs.featured);

export const getCaseStudyById = (id: string) => caseStudies.find(cs => cs.id === id); 