import { User } from "./user.js"

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

  twoFactorAuth: boolean;
}
