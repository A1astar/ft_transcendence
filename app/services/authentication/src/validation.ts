export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 20;
// Allow alphanumeric, underscore, hyphen
export const USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/; 

export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function validateUsername(username: string): string | null {
    if (!username) return "Username is required";
    if (username.length < USERNAME_MIN_LENGTH || username.length > USERNAME_MAX_LENGTH) {
        return `Username must be between ${USERNAME_MIN_LENGTH} and ${USERNAME_MAX_LENGTH} characters`;
    }
    if (!USERNAME_REGEX.test(username)) {
        return "Username can only contain letters, numbers, underscores, and hyphens";
    }
    return null;
}

export function validateEmail(email: string): string | null {
    if (!email) return null; 
    if (!EMAIL_REGEX.test(email)) {
        return "Invalid email format";
    }
    return null;
}

export function validatePassword(password: string): string | null {
    if (!password) return "Password is required";
    if (password.length < 8) {
        return "Password must be at least 8 characters long";
    }
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
    if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter";
    if (!/[0-9]/.test(password)) return "Password must contain at least one number";
    
    return null;
}

