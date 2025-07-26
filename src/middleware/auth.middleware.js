import jwt from 'jsonwebtoken';
import constant, { envVariables } from '../constant.js';
import { User } from '../models/user.model.js';
import ApiError from '../utils/errorhandler.js';
import asyncHandler from '../utils/asynchandler.js';

export const verifyJwt = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '');
    
    // If no token, continue (for public routes) or throw error (for protected routes)
    if (!token) {
        if (constant.publicRouts.some(route => req.path.includes(route))) {
            return next(); // Public route, no token required
        }
        throw new ApiError(401, 'Unauthorized request: No token provided');
    }
    
    try {
        const decodedToken = jwt.verify(token, envVariables.accessTokenSecret);
        const user = await User.findById(decodedToken._id).select('-password -refreshToken');
        if (!user) {
            throw new ApiError(401, 'Unauthorized request: Invalid token');
        }
        if (user.isDisabled) {
            throw new ApiError(403, 'User account is disabled');
        }
        req.user = user;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            throw new ApiError(401, 'Unauthorized request: Token has expired');
        } else if (err.name === 'JsonWebTokenError') {
            throw new ApiError(401, 'Unauthorized request: Malformed token');
        } else {
            console.error('JWT verification error:', err);
            throw new ApiError(500, 'Internal server error during token verification');
        }
    }
});
