import { FastifyReply } from "fastify";

/**
 * Validation error class for consistent error handling
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Sanitizes string input by trimming whitespace and removing control characters
 */
export function sanitizeString(input: string): string {
  if (typeof input !== "string") {
    return "";
  }
  // Remove control characters and zero-width characters
  return input.trim().replace(/[\x00-\x1F\x7F-\x9F\u200B-\u200D\uFEFF]/g, "");
}

/**
 * Validates username/alias
 * - Must be 2-12 characters
 */
export function validateUsername(username: unknown): string {
  if (typeof username !== "string") {
    throw new ValidationError("Username must be a string", "name");
  }

  const sanitized = sanitizeString(username);

  if (sanitized.length < 2) {
    throw new ValidationError(
      "Username must be at least 2 characters long",
      "name"
    );
  }

  if (sanitized.length > 12) {
    throw new ValidationError("Username must not exceed 12 characters", "name");
  }

  return sanitized;
}

/**
 * Validates email format (optional field)
 */
export function validateEmail(email: unknown): string | null {
  if (email === null || email === undefined || email === "") {
    return null;
  }

  if (typeof email !== "string") {
    throw new ValidationError("Email must be a string", "email");
  }

  const sanitized = sanitizeString(email);

  if (sanitized.length > 255) {
    throw new ValidationError("Email must not exceed 255 characters", "email");
  }

  if (!sanitized.includes("@")) {
    throw new ValidationError("Invalid email format", "email");
  }

  return sanitized.toLowerCase();
}

/**
 * Validates password
 * - Minimum 4 characters
 * - Maximum 128 characters (to prevent DoS via scrypt)
 */
export function validatePassword(password: unknown): string {
  if (typeof password !== "string") {
    throw new ValidationError("Password must be a string", "password");
  }

  if (password.length < 4) {
    throw new ValidationError(
      "Password must be at least 4 characters long",
      "password"
    );
  }

  if (password.length > 128) {
    throw new ValidationError(
      "Password must not exceed 128 characters",
      "password"
    );
  }

  return password;
}

/**
 * Validates registration data
 */
export interface ValidatedRegistration {
  name: string;
  email: string | null;
  password: string;
}

export function validateRegistrationData(body: any): ValidatedRegistration {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Invalid request body");
  }

  const name = validateUsername(body.name);
  const email = validateEmail(body.email);
  const password = validatePassword(body.password);

  return { name, email, password };
}

/**
 * Validates login data
 */
export interface ValidatedLogin {
  email: string;
  password: string;
  token?: string;
}

export function validateLoginData(body: any): ValidatedLogin {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Invalid request body");
  }

  let email = validateEmail(body.email);
  if (!email) {
    // Fallback: accept username-style login for legacy accounts
    if (!body.name || typeof body.name !== "string") {
      throw new ValidationError("Email is required", "email");
    }
    const name = sanitizeString(body.name);
    if (!name) {
      throw new ValidationError("Email is required", "email");
    }
    email = name.toLowerCase();
  }

  if (!body.password || typeof body.password !== "string") {
    throw new ValidationError("Password is required", "password");
  }
  const password = validatePassword(body.password);

  let token: string | undefined = undefined;
  const rawToken = body.token ?? body.twoFactorCode;
  if (rawToken !== undefined) {
    if (typeof rawToken !== "string") {
      throw new ValidationError("2FA token must be a string", "token");
    }
    token = sanitizeString(rawToken);
    if (token.length > 12) {
      throw new ValidationError("2FA token is too long", "token");
    }
  }

  return { email, password, token };
}

/**
 * Helper function to send validation error response
 */
export function sendValidationError(
  reply: FastifyReply,
  error: ValidationError
): void {
  reply.code(400).send({
    error: error.message,
    field: error.field,
  });
}

/**
 * Rate limiting - simple in-memory implementation
 */
const requestCounts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const record = requestCounts.get(identifier);

  if (!record || now > record.resetAt) {
    requestCounts.set(identifier, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}
