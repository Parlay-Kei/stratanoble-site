// Client-safe stubs for stripe-server functionality
// This file provides safe fallbacks when imported on the client side

// Safe client-side exports that won't cause errors
export const getStripe = () => {
  if (typeof window !== 'undefined') {
    console.warn('getStripe called on client side - returning null');
    return null;
  }
  // This should never be reached on client side, but provide a safe fallback
  return null;
};

export const createCheckoutSession = async () => {
  throw new Error('createCheckoutSession is only available on the server side');
};

export const sendKickoffEmail = async () => {
  throw new Error('sendKickoffEmail is only available on the server side');
};

export const createConnectedAccount = async () => {
  throw new Error('createConnectedAccount is only available on the server side');
};

export const createAccountLink = async () => {
  throw new Error('createAccountLink is only available on the server side');
};
