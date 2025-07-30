// Global TypeScript declarations for analytics
declare global {
  interface Window {
    gtag?: (
      command: 'event',
      eventName: string,
      parameters: Record<string, any>
    ) => void;
  }
}

export {};