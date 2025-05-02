// Validation utilities for Telegram-style username
export function validateUsername(username) {
    // Telegram username rules:
    // 1. Starts with @
    // 2. 5-32 characters long
    // 3. Can contain lowercase letters, digits, and underscores
    // 4. Cannot start with a digit or contain consecutive underscores
    // 5. Cannot end with an underscore
    const usernameRegex = /^@[a-z](?!.*__)[a-z0-9_]{3,30}[a-z0-9]$/i;
    return usernameRegex.test(username);
}

export function validatePassword(password) {
    // Example password validation (at least 8 characters)
    return password.length >= 8;
}