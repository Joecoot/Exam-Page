export function isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

export function isValidPassword(password) {
    const minLength = 8;
    return password.length >= 8;
}

export function isValidName(name) {
    return Boolean(name);
}