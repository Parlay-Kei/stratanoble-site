// Auth Module API Contracts
// Version: 1.0.0

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  success: boolean;
  user: {
    id: string;
    email: string;
    name: string;
  };
  session: {
    token: string;
    expiresAt: string;
  };
  error?: AuthError;
}

export interface LogoutRequest {
  sessionToken: string;
}

export interface LogoutResponse {
  success: boolean;
  error?: AuthError;
}

export interface SessionCheckRequest {
  sessionToken: string;
}

export interface SessionCheckResponse {
  valid: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
  };
  expiresAt?: string;
  error?: AuthError;
}

export interface AuthError {
  code: AuthErrorCode;
  message: string;
  details?: Record<string, any>;
}

export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}
