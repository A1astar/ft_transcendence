import { User } from "./user.js"

export interface RegistrationFormat {
    name: string;
    email: string;
    password: string;
}

export interface AuthenticationFormat {
    name: string;
    email: string;
    passwordHash: string;
}

export interface UserFormat {
  id: number;                    // primary key
  email: string;
  passwordHash: string;

  username?: string;
  firstName?: string;
  lastName?: string;
  role?: string;                 // admin, user, etc.
  status?: string;               // active, suspended, etc.

  profileImageUrl?: string;

  lastLoginAt?: string;          // ISO timestamp
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface SessionFormat {
  id: number;                    // primary key
  sessionId: string;             // cookie or token identifier
  userId?: number;               // null for guests

  accessToken?: string;
  refreshToken?: string;
  csrfToken?: string;
  scope?: string;                // OAuth scopes or custom permissions

  ipAddress?: string;
  userAgent?: string;
  deviceType?: string;
  os?: string;
  browser?: string;

  isActive: boolean;
  isRevoked: boolean;
  failedAttempts: number;

  loginMethod?: string;          // password, oauth_google, etc.
  mfaPassed?: boolean;
  riskLevel?: "low" | "medium" | "high";
  location?: string;

  sessionData?: Record<string, any>;

  createdAt: string;
  updatedAt: string;
  lastAccessedAt: string;
  expiresAt: string;
}