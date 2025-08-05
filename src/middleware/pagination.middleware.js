import ApiError from '../utils/errorhandler.js';

/**
 * Enhanced pagination middleware for Mongoose models.
 * Usage: router.get('/endpoint', paginationMiddleware(Model, { select, populate, sort }), controller)
 *
 * @param {Mongoose.Model} model - The Mongoose model to paginate.
 * @param {Object} options - Optional configuration (select, populate, sort, defaultLimit, maxLimit).
 */
const paginationMiddleware = (model, options = {}) => async (req, res, next) => {
    try {
        let { page = 1, limit = 10, sort, ...filters } = req.query;
        
        // Remove empty, undefined, or null filters
        Object.keys(filters).forEach(key => {
            if (filters[key] === '' || filters[key] === undefined || filters[key] === null) {
                delete filters[key];
            }
        });
        
        // Validate and sanitize pagination parameters
        page = Math.max(1, parseInt(page, 10) || 1);
        const defaultLimit = options.defaultLimit || 10;
        const maxLimit = options.maxLimit || 100;
        limit = Math.min(Math.max(1, parseInt(limit, 10) || defaultLimit), maxLimit);
        
        const skip = (page - 1) * limit;

        // Validate sort parameter to prevent injection attacks
        if (sort && typeof sort === 'string') {
            const allowedSortFields = options.allowedSortFields || ['createdAt', 'updatedAt', 'userName', 'fullName', 'email'];
            const sortField = sort.startsWith('-') ? sort.slice(1) : sort;
            if (!allowedSortFields.includes(sortField)) {
                throw new ApiError(400, `Invalid sort field: ${sortField}`);
            }
        }

        // Build query with error handling
        let query = model.find(filters);
        
        // Apply select to exclude sensitive fields by default
        if (options.select) {
            query = query.select(options.select);
        } else {
            // Default security: exclude sensitive fields
            query = query.select('-password -refreshToken');
        }
        
        // Apply populate if specified
        if (options.populate) {
            if (Array.isArray(options.populate)) {
                options.populate.forEach(populateOption => {
                    query = query.populate(populateOption);
                });
            } else {
                query = query.populate(options.populate);
            }
        }
        
        // Apply sorting
        if (sort || options.sort) {
            query = query.sort(sort || options.sort);
        }
        
        // Apply pagination
        query = query.skip(skip).limit(limit);

        // Execute query and count in parallel for better performance
        const [results, total] = await Promise.all([
            query.exec(),
            model.countDocuments(filters)
        ]);

        // Calculate pagination metadata
        const totalPages = Math.ceil(total / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        // Store results in response object
        res.paginatedResults = {
            results,
            page,
            limit,
            totalPages,
            totalResults: total,
            hasNextPage,
            hasPrevPage
        };
        
        next();
    } catch (error) {
        // Handle specific error types
        if (error instanceof ApiError) {
            next(error);
        } else if (error.name === 'CastError') {
            next(new ApiError(400, 'Invalid query parameters'));
        } else if (error.name === 'ValidationError') {
            next(new ApiError(400, 'Validation error in query parameters'));
        } else {
            console.error('Pagination middleware error:', error);
            next(new ApiError(500, 'Internal server error during pagination'));
        }
    }
};

export default paginationMiddleware; 