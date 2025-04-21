// Validation utilities
export function validateUsername(username) {
    // Check if username starts with '@' and contains at least 5 English letters
    const usernameRegex = /^@[a-zA-Z]{5,}$/;
    return usernameRegex.test(username);
}

export function validatePassword(password) {
    // Example password validation (at least 8 characters)
    return password.length >= 8;
}