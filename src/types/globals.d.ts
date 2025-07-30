// Global TypeScript declarations for analytics
declare global {
  interface Window {
    gtag?: (
      command: 'event',
      eventName: string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      parameters: Record<string, any>
    ) => void;
  }
}

export {};