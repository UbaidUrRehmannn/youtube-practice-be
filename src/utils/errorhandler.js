import constant from '../constant.js';

// Define a custom error class that extends the built-in Error class of Node.js
class ApiError extends Error {
    // The constructor method is called when a new instance of ApiError is created
    constructor(
        // The HTTP status code of the error (e.g., 404, 500)
        statusCode,

        // The error message, with a default value from constants if not provided
        message = constant.messages.error,

        // An array of additional error details, defaulting to an empty array
        errors = [],

        // The stack trace of the error, defaulting to an empty string
        stack = '',
    ) {
        // Call the parent class (Error) constructor with the message
        super(message);

        // Assign the HTTP status code to the instance
        this.statusCode = statusCode;

        // The data property is set to null (could be used for additional error context)
        this.data = null;

        // Assign the error message to the instance
        this.message = message;

        // Indicate that the API response was not successful
        this.success = false;

        // Assign the additional error details to the instance
        this.errors = errors;

        // If a stack trace was provided, use it; otherwise, capture a new stack trace
        if (stack.length > 0) {
            // Use the provided stack trace
            this.stack = stack;
        } else {
            // Capture the current stack trace, excluding the constructor call
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export default ApiError;
