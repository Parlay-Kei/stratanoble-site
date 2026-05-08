// Standardized CTA (Call-to-Action) labels across the application
// This ensures consistent messaging and user experience

export const CTA_LABELS = {
  // Primary Actions
  GET_STARTED: 'Start Your Free Diagnostic',
  SCHEDULE_CALL: 'Schedule Diagnostic Call',
  CONTACT_US: 'Contact Us',
  
  // Quote/Consultation Related
  REQUEST_QUOTE: 'Request Custom Quote',
  GET_QUOTE: 'Get Custom Quote', 
  SCHEDULE_CONSULTATION: 'Schedule Free Consultation',
  
  // Discovery/Learning
  LEARN_MORE: 'Learn More',
  BOOK_DISCOVERY: 'Book Diagnostic Session',
  SCHEDULE_DISCOVERY: 'Schedule Diagnostic Call',
  
  // Service Specific
  SCHEDULE_SESSION: 'Schedule Your Free Diagnostic Session',
  BOOK_CONSULTATION: 'Book Free Consultation',
  START_ANALYSIS: 'Start Diagnostic Intake',
  
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
  JOIN_WORKSHOP: 'Join Waitlist',
  REGISTER_NOW: 'Register Interest',
  SAVE_SPOT: 'Reserve Your Spot'
} as const;

export type CTALabel = typeof CTA_LABELS[keyof typeof CTA_LABELS];

// Helper function to get consistent CTA label
export function getCTALabel(key: keyof typeof CTA_LABELS): string {
  return CTA_LABELS[key];
}
