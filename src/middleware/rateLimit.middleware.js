import ApiError from '../utils/errorhandler.js';

// Simple in-memory store for rate limiting
// In production, use Redis or a proper caching solution
const rateLimitStore = new Map();

/**
 * Rate limiting middleware
 * @param {Object} options - Rate limiting options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.maxRequests - Maximum requests per window
 * @param {string} options.keyGenerator - Function to generate rate limit key
 */
export const rateLimit = (options = {}) => {
    const {
        windowMs = 15 * 60 * 1000, // 15 minutes
        maxRequests = 5, // 5 requests per window
        keyGenerator = (req) => req.ip // Use IP as default key
    } = options;

    return (req, res, next) => {
        const key = keyGenerator(req);
        const now = Date.now();
        
        // Get current rate limit data for this key
        const rateLimitData = rateLimitStore.get(key) || {
            requests: 0,
            resetTime: now + windowMs
        };

        // Reset if window has expired
        if (now > rateLimitData.resetTime) {
            rateLimitData.requests = 0;
            rateLimitData.resetTime = now + windowMs;
        }

        // Check if limit exceeded
        if (rateLimitData.requests >= maxRequests) {
            const resetTime = new Date(rateLimitData.resetTime).toISOString();
            
            // Set rate limit headers
            res.set({
                'X-RateLimit-Limit': maxRequests,
                'X-RateLimit-Remaining': 0,
                'X-RateLimit-Reset': resetTime,
                'Retry-After': Math.ceil(windowMs / 1000)
            });

            throw new ApiError(
                429, 
                `Too many requests. Please try again after ${Math.ceil(windowMs / 1000)} seconds.`
            );
        }

        // Increment request count
        rateLimitData.requests++;
        rateLimitStore.set(key, rateLimitData);

        // Set rate limit headers
        res.set({
            'X-RateLimit-Limit': maxRequests,
            'X-RateLimit-Remaining': maxRequests - rateLimitData.requests,
            'X-RateLimit-Reset': new Date(rateLimitData.resetTime).toISOString()
        });

        next();
    };
};

/**
 * Specific rate limiter for refresh token endpoint
 * More restrictive than general rate limiting
 */
export const refreshTokenRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 3, // Only 3 refresh attempts per 15 minutes
    keyGenerator: (req) => {
        // Use IP + User-Agent for better identification
        const userAgent = req.get('User-Agent') || 'unknown';
        return `${req.ip}-${userAgent}`;
    }
});

/**
 * General API rate limiter
 */
export const apiRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // 100 requests per 15 minutes
    keyGenerator: (req) => req.ip
}); 