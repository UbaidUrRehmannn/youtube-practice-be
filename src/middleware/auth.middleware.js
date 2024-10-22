import jwt from 'jsonwebtoken';
import constant from '../constant.js';
import { User } from '../models/user.model.js';
import ApiError from '../utils/errorhandler.js';
import asyncHandler from '../utils/asynchandler.js';

export const verifyJwt = asyncHandler(async (req, res, next) => {
    // Check if the route is public and bypass verification if true
    if (constant.publicRouts.some(route => req.path.includes(route))) {
        return next();
    }
    const token =  req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        throw new ApiError(401, 'Unauthorized request: No token provided');
    }
    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken._id).select('-password -refreshToken');
        if (!user) {
            throw new ApiError(401, 'Unauthorized request: Invalid token');
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
