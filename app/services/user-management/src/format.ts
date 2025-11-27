export interface UserFormat {
  // Indentity & Authentication
  id: string;                    // primary key
  email: string;
  password: string;
  twoFactorAuth: boolean;

  // Profile information
  username?: string;
  firstName?: string;
  lastName?: string;
  role?: string;                 // admin, user, etc.
  status?: string;               // active, suspended, etc.

  // Avatar/Profile Picture
  profileImageUrl?: string;      // URL or path to avatar (e.g., "/uploads/avatars/user123.jpg")
  // Alternative: profileImageData?: string;  // Base64 encoded image if storing directly

  // Game statistics
  gamePlayed?: number;
  gameWon?: number;
  gameLost?: number;
  winRate?: number;

  // Timestamps
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}
