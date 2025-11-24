import crypto from 'crypto';

/**
 * Password hashing using a bcrypt-style approach (via Node.js pbkdf2).
 * For production workloads you may switch to the bcrypt package.
 */
export async function hashPassword(password: string): Promise<string> {
    const salt = crypto.randomBytes(16).toString('hex');
    const iterations = 100000; // iteration count
    const keyLength = 64; // key length
    const digest = 'sha512'; // hash algorithm

    const hash = crypto.pbkdf2Sync(password, salt, iterations, keyLength, digest);

    // Format: iterations$salt$hash (all hex encoded)
    return `${iterations}$${salt}$${hash.toString('hex')}`;
}

/** Verify password */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
        // Parse format: iterations$salt$hash
        const parts = hashedPassword.split('$');
        if (parts.length !== 3) {
            return false;
        }

        const iterations = parseInt(parts[0] || '10000', 10);
        const salt = parts[1] || '';
        const storedHash = parts[2] || '';

        // Recalculate hash with same parameters
        const hash = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512');

        // Use timing-safe comparison to prevent timing attacks
        return crypto.timingSafeEqual(Buffer.from(storedHash, 'hex'), hash);
    } catch (error) {
        return false;
    }
}

