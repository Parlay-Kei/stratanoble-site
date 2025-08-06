export interface Testimonial {
  id: string
  quote: string
  author: {
    name: string
    title: string
    company: string
    initials: string
    avatar?: string
  }
  rating: number
  service: string
  result?: string
  featured?: boolean
}

export const testimonials: Testimonial[] = [
  {
    id: 'sarah-mitchell',
    quote: "Strata Noble transformed our startup from a passion project into a profitable business. Their strategic guidance and systematic approach helped us scale from $0 to $50K in just 6 months.",
    author: {
      name: 'Sarah Mitchell',
      title: 'Founder',
      company: 'TechStart Inc',
      initials: 'SM'
    },
    rating: 5,
    service: 'Idea to Execution Strategy',
    result: '$0 to $50K MRR in 6 months (Jan-June 2024)',
    featured: true
  },
  {
    id: 'michael-chen',
    quote: "The AI/No-Code stack they set up for us automated 80% of our manual processes. We went from spending 20 hours a week on admin to just 4 hours.",
    author: {
      name: 'Michael Chen',
      title: 'CEO',
      company: 'InnovateCorp',
      initials: 'MC'
    },
    rating: 5,
    service: 'AI/No-Code Stack Setup',
    result: '80% admin process automation (measured Q3 2024)'
  },
  {
    id: 'jessica-rodriguez',
    quote: "Their ops blueprint gave us the confidence to delegate properly. We've grown our team from 2 to 8 people while maintaining quality and culture.",
    author: {
      name: 'Jessica Rodriguez',
      title: 'Operations Director',
      company: 'GrowthLabs',
      initials: 'JR'
    },
    rating: 5,
    service: 'Ops & Delegation Blueprint',
    result: 'Team growth: 2 to 8 people (Feb-Oct 2024)'
  },
  {
    id: 'david-kim',
    quote: "The 1:1 workshops were game-changing. In just 2 hours, we identified our biggest bottleneck and had a clear action plan to fix it.",
    author: {
      name: 'David Kim',
      title: 'Founder',
      company: 'FutureWorks',
      initials: 'DK'
    },
    rating: 5,
    service: '1:1 Workshops & Advisory',
    result: 'Bottleneck identified and resolved'
  },
  {
    id: 'emma-williams',
    quote: "Their analytics setup helped us understand our customer journey better than ever. We increased our conversion rate by 40% in the first quarter.",
    author: {
      name: 'Emma Williams',
      title: 'Marketing Director',
      company: 'ScaleUp Solutions',
      initials: 'EW'
    },
    rating: 5,
    service: 'Performance Analytics',
    result: '40% conversion rate increase (Q1 2024 vs Q4 2023)'
  },
  {
    id: 'alex-thompson',
    quote: "Working with Strata Noble was like having a business coach, strategist, and implementation partner all in one. They don't just give advice - they help you execute.",
    author: {
      name: 'Alex Thompson',
      title: 'Co-Founder',
      company: 'Vision Ventures',
      initials: 'AT'
    },
    rating: 5,
    service: 'Idea to Execution Strategy',
    result: 'Complete business transformation'
  }
]

export const featuredTestimonials = testimonials.filter(t => t.featured)
export const recentTestimonials = testimonials.slice(0, 3) 