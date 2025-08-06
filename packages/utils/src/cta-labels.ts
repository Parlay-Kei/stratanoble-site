// Standardized CTA (Call-to-Action) labels across the application
// This ensures consistent messaging and user experience

export const CTA_LABELS = {
  // Primary Actions
  GET_STARTED: 'Get Started',
  SCHEDULE_CALL: 'Schedule Free Discovery Call',
  CONTACT_US: 'Contact Us',
  
  // Quote/Consultation Related
  REQUEST_QUOTE: 'Request Custom Quote',
  GET_QUOTE: 'Get Custom Quote', 
  SCHEDULE_CONSULTATION: 'Schedule Free Consultation',
  
  // Discovery/Learning
  LEARN_MORE: 'Learn More',
  BOOK_DISCOVERY: 'Book Discovery Session',
  SCHEDULE_DISCOVERY: 'Schedule Discovery Call',
  
  // Service Specific
  SCHEDULE_SESSION: 'Schedule Your Free Discovery Session',
  BOOK_CONSULTATION: 'Book Free Consultation',
  START_ANALYSIS: 'Start Data Analysis',
  
  // Secondary Actions
  VIEW_CASE_STUDIES: 'View Case Studies',
  READ_MORE: 'Read More',
  EXPLORE_SERVICES: 'Explore Services',
  
  // Navigation
  BACK_HOME: 'Return Home',
  VIEW_ALL: 'View All',
  
  // Form Related
  SUBMIT: 'Submit',
  SEND_MESSAGE: 'Send Message',
  SUBSCRIBE: 'Subscribe',
  
  // Workshop/Event Related
  JOIN_WORKSHOP: 'Join Workshop',
  REGISTER_NOW: 'Register Now',
  SAVE_SPOT: 'Save Your Spot'
} as const;

export type CTALabel = typeof CTA_LABELS[keyof typeof CTA_LABELS];

// Helper function to get consistent CTA label
export function getCTALabel(key: keyof typeof CTA_LABELS): string {
  return CTA_LABELS[key];
}