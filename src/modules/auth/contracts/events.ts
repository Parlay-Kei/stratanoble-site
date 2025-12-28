// Auth Module Event Contracts
// Version: 1.0.0

export interface UserAuthenticatedEvent {
  eventName: 'user.authenticated.v1';
  eventId: string;
  timestamp: string;
  correlationId: string;
  payload: {
    userId: string;
    email: string;
    authenticationMethod: 'password' | 'oauth' | 'sso';
    ipAddress: string;
    userAgent: string;
  };
}

export interface UserSessionCreatedEvent {
  eventName: 'user.session.created.v1';
  eventId: string;
  timestamp: string;
  correlationId: string;
  payload: {
    userId: string;
    sessionId: string;
    expiresAt: string;
    ipAddress: string;
    userAgent: string;
  };
}

export interface UserSessionExpiredEvent {
  eventName: 'user.session.expired.v1';
  eventId: string;
  timestamp: string;
  correlationId: string;
  payload: {
    userId: string;
    sessionId: string;
    expiredAt: string;
    reason: 'timeout' | 'manual_logout' | 'forced_logout';
  };
}

export interface UserPasswordChangedEvent {
  eventName: 'user.password.changed.v1';
  eventId: string;
  timestamp: string;
  correlationId: string;
  payload: {
    userId: string;
    changedAt: string;
    ipAddress: string;
    userAgent: string;
  };
}

// Event type union for type safety
export type AuthEvent =
  | UserAuthenticatedEvent
  | UserSessionCreatedEvent
  | UserSessionExpiredEvent
  | UserPasswordChangedEvent;
