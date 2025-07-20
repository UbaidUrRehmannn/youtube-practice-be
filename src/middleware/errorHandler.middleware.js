import ApiError from '../utils/errorhandler.js'
import { envVariables } from '../constant.js';

export const errorHandler = (err, req, res, next) => {
    const isDev = envVariables.environment === 'DEV';

    // If the error is an instance of ApiError, use its properties
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            statusCode: err.statusCode,
            data: err.data,
            message: err.message,
            success: err.success,
            stack: isDev ? err.stack : ''  // Include stack only in DEV
        });
    }

    // For any other errors, respond with a generic error structure
    return res.status(500).json({
        statusCode: 500,
        data: null,
        message: 'Internal Server Error',
        success: false,
        stack: isDev ? err.stack : ''  // Include stack only in DEV
    });
};