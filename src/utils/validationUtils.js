// Function to check if a value is null, undefined, or empty after trimming
export const isEmpty = (value) => {
    return !value || (typeof value === 'string' && value.trim() === '');
};

// Function to validate email format
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Function to handle trimming and case normalization safely
const normalizeInput = (value, { toLowerCase = false, toUpperCase = false } = {}) => {
    if (typeof value !== 'string') return ''; // Return an empty string if value is not a string
    let normalized = value.trim();
    if (toLowerCase) normalized = normalized.toLowerCase();
    if (toUpperCase) normalized = normalized.toUpperCase();
    return normalized;
};

// Function to validate user input
const validateUserInput = ({ userName, email, fullName, password }) => {
    const errors = [];

    // Validate userName
    if (isEmpty(userName)) {
        errors.push('Username is required');
    }

    // Validate email
    if (isEmpty(email)) {
        errors.push('Email is required');
    } else if (!isValidEmail(email)) {
        errors.push('Email format is invalid');
    }

    // Validate fullName
    if (isEmpty(fullName)) {
        errors.push('Full name is required');
    }

    // Validate password
    if (isEmpty(password)) {
        errors.push('Password is required');
    }

    // Return the array of errors (empty if no errors)
    return errors;
};

