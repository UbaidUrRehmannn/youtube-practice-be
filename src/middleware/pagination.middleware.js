import ApiError from '../utils/errorhandler.js';

/**
 * Pagination middleware for Mongoose models.
 * Usage: router.get('/endpoint', paginationMiddleware(Model, { select, populate, sort }), controller)
 *
 * @param {Mongoose.Model} model - The Mongoose model to paginate.
 * @param {Object} options - Optional configuration (select, populate, sort, defaultLimit, maxLimit).
 */
const paginationMiddleware = (model, options = {}) => async (req, res, next) => {
    try {
        let { page = 1, limit = 10, sort, ...filters } = req.query;
        page = parseInt(page, 10) || 1;
        limit = Math.min(parseInt(limit, 10) || options.defaultLimit || 10, options.maxLimit || 100);
        const skip = (page - 1) * limit;

        // Build query
        let query = model.find(filters);
        if (options.select) query = query.select(options.select);
        if (options.populate) query = query.populate(options.populate);
        if (sort || options.sort) query = query.sort(sort || options.sort);
        query = query.skip(skip).limit(limit);

        const [results, total] = await Promise.all([
            query.exec(),
            model.countDocuments(filters)
        ]);

        res.paginatedResults = {
            results,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            totalResults: total,
            hasNextPage: page * limit < total,
            hasPrevPage: page > 1
        };
        next();
    } catch (error) {
        next(new ApiError(500, error.message || 'Pagination error'));
    }
};

export default paginationMiddleware; 