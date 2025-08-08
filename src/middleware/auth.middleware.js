import jwt from 'jsonwebtoken';
import constant, { envVariables } from '../constant.js';
import { User } from '../models/user.model.js';
import ApiError from '../utils/errorhandler.js';
import asyncHandler from '../utils/asynchandler.js';

export const verifyJwt = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '');
    
    // Check if this is a public route (no auth required)
    // For public routes, we allow requests without a token, but if a token is present,
    // we will try to verify it and attach req.user so that public endpoints can
    // optionally leverage the authenticated context (e.g., admin creating another admin).
    if (constant.publicRouts.some(route => req.path.includes(route))) {
        if (!token) {
            return next(); // Public route, no token provided
        }
        try {
            const decodedToken = jwt.verify(token, envVariables.accessTokenSecret);
            const user = await User.findById(decodedToken._id).select('-password -refreshToken');
            if (user && !user.isDisabled) {
                req.user = user; // Attach user context but do not enforce auth for public routes
            }
            return next();
        } catch (err) {
            // Invalid token should not block access to public routes
            return next();
        }
    }
    
    // Special handling for logout endpoint - allow expired tokens
    if (req.path.includes('/logout') && token) {
        try {
            // Try to decode the token (even if expired) to get user ID
            const decodedToken = jwt.decode(token, { complete: true });
            if (decodedToken && decodedToken.payload._id) {
                // Set a minimal user object for logout
                req.user = { _id: decodedToken.payload._id };
                return next();
            }
        } catch (err) {
            // If token is completely invalid, continue to normal error handling
        }
    }
    
    // If no token and not a public route, throw error
    if (!token) {
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
