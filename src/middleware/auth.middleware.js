
import jwt from 'jsonwebtoken';
import constant from '../constant.js'
import { User } from '../models/user.model.js'
import ApiError from '../utils/errorhandler.js';
import asyncHandler from '../utils/asynchandler.js';

export const verifyJwt = asyncHandler( async (req, res, next) => {
    if (constant.publicRouts.some(route => req.path.includes(route))) {
        return next();
    }
    try {
        const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            throw new ApiError(401, 'Unauthorized request: No token provided');
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken._id).select('-password -refreshToken');
        if (!user) {
            throw new ApiError(401, 'Unauthorized request: Invalid token');
        }
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(500, error?.message || 'Internal server error: something went wrong in auth.middleware');
    }
});