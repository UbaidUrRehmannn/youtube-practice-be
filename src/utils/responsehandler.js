 import constant from '../constant.js';

// Define a class to represent a standardized API response
class ApiResponse {
    // The constructor method is called when a new instance of ApiResponse is created
    constructor(
        // The HTTP status code of the response (e.g., 200, 404)
        statusCode,

        // The data to be included in the response
        data,

        // The response message, with a default value from constants if not provided
        message = constant.messages.success
    ) {
        // Assign the HTTP status code to the instance
        this.statusCode = statusCode;

        // Assign the data to the instance
        this.data = data;

        // Assign the response message to the instance
        this.message = message;

        // Determine if the response indicates success based on the status code
        // HTTP status codes less than 400 are considered successful
        this.success = statusCode < 400;
    }
}

// Export the ApiResponse class as the default export from this module
export default ApiResponse;
