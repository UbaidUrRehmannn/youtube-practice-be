import { Tweet } from '../models/tweet.model.js';
import { User } from '../models/user.model.js';
import { Comment } from '../models/comment.model.js';
import ApiError from '../utils/errorhandler.js';
import asyncHandler from '../utils/asynchandler.js';
import {
    uploadImage,
    deleteImage,
    removeLocalFile,
} from '../utils/cloudinary.js';
import ApiResponse from '../utils/responsehandler.js';
import { tweetStatuses, userRoles } from '../constant.js';
import mongoose from 'mongoose';

// Simple cache for admin user IDs (in-memory cache, resets on server restart)
let adminUserIdsCache = null;
let adminUserIdsCacheTime = 0;
const ADMIN_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Helper function to invalidate admin cache
const invalidateAdminCache = () => {
    adminUserIdsCache = null;
    adminUserIdsCacheTime = 0;
};

// Helper function to get admin user IDs with caching
const getAdminUserIds = async () => {
    const now = Date.now();
    if (adminUserIdsCache && now - adminUserIdsCacheTime < ADMIN_CACHE_TTL) {
        return adminUserIdsCache;
    }

    const adminUsers = await User.aggregate([
        { $match: { role: userRoles.ADMIN } },
        { $project: { _id: 1 } },
    ]);

    adminUserIdsCache = adminUsers.map((user) => user._id);
    adminUserIdsCacheTime = now;

    return adminUserIdsCache;
};

// Helper function to handle image upload
const handleImageUpload = async (req, existingImageUrl = null) => {
    if (!req.file) return existingImageUrl;

    const localFilePath = req.file.path;
    const fileMimeType = req.file.mimetype;

    // Validate image type (webp)
    if (!fileMimeType.startsWith('image/')) {
        removeLocalFile(localFilePath);
        throw new ApiError(400, 'Only image files are allowed');
    }
    if (fileMimeType !== 'image/webp') {
        removeLocalFile(localFilePath);
        throw new ApiError(400, 'Only webp images are allowed');
    }

    // Upload to Cloudinary
    const uploadedImage = await uploadImage(localFilePath);
    if (!uploadedImage?.url) {
        removeLocalFile(localFilePath);
        throw new ApiError(500, 'Error while uploading image');
    }

    // Clean up local file
    removeLocalFile(localFilePath);

    // Delete old image if exists
    if (existingImageUrl) {
        await deleteImage(existingImageUrl);
    }

    return uploadedImage.url;
};

// Helper function to process tags
const processTags = (tags) => {
    if (!tags) return [];
    return Array.isArray(tags)
        ? tags.map((tag) => tag.trim()).filter((tag) => tag)
        : tags
              .split(',')
              .map((tag) => tag.trim())
              .filter((tag) => tag);
};

// Helper function to build sort options
const buildSortOptions = (sortBy = '-createdAt') => {
    const sortOptions = {};
    if (sortBy.startsWith('-')) {
        sortOptions[sortBy.slice(1)] = -1;
    } else {
        sortOptions[sortBy] = 1;
    }
    return sortOptions;
};

// Helper function to check tweet visibility permissions
const canViewTweet = (tweet, user) => {
    if (tweet.status === tweetStatuses.PUBLISHED) return true;
    if (!user) return false;

    const isOwner = tweet.author.toString() === user._id.toString();
    const isAdmin = user.role === userRoles.ADMIN;
    const isModerator = user.role === userRoles.MODERATOR;

    return isOwner || isAdmin || isModerator;
};

// Helper function for consistent validation and error handling
const validateTweetId = (id) => {
    if (!id) {
        throw new ApiError(400, 'Tweet ID is required');
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, 'Invalid tweet ID');
    }
    return new mongoose.Types.ObjectId(id);
};

// Helper function to validate status
const validateStatus = (status) => {
    if (status && !Object.values(tweetStatuses).includes(status)) {
        throw new ApiError(400, 'Invalid status');
    }
    return status;
};

// Helper function to validate author ID
const validateAuthorId = (authorId) => {
    if (authorId && !mongoose.Types.ObjectId.isValid(authorId)) {
        throw new ApiError(400, 'Invalid author ID');
    }
    return authorId ? new mongoose.Types.ObjectId(authorId) : null;
};

// Helper function to validate and sanitize pagination parameters
const validatePaginationParams = (page = 1, limit = 10, maxLimit = 100) => {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(Math.max(1, parseInt(limit, 10) || 10), maxLimit);
    return { page: pageNum, limit: limitNum };
};

// Helper function to sanitize search input
const sanitizeSearchInput = (searchTerm) => {
    if (!searchTerm || typeof searchTerm !== 'string') {
        return null;
    }

    // Remove special regex characters to prevent injection
    const sanitized = searchTerm.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return sanitized.length > 0 ? sanitized : null;
};

// Helper function to validate boolean parameters
const validateBooleanParam = (value) => {
    if (value === undefined || value === null) {
        return undefined;
    }
    if (typeof value === 'boolean') {
        return value;
    }
    if (typeof value === 'string') {
        const lowerValue = value.toLowerCase();
        if (lowerValue === 'true' || lowerValue === '1') {
            return true;
        }
        if (lowerValue === 'false' || lowerValue === '0') {
            return false;
        }
    }
    throw new ApiError(400, 'Invalid boolean parameter');
};

// Helper function to handle empty aggregation results
const handleAggregationResult = (result, errorMessage = 'No data found') => {
    if (!result || result.length === 0) {
        throw new ApiError(404, errorMessage);
    }
    return result[0];
};

// Common aggregation pipeline stages
const AGGREGATION_STAGES = {
    // Basic author lookup
    authorLookup: {
        $lookup: {
            from: 'users',
            localField: 'author',
            foreignField: '_id',
            as: 'author',
        },
    },

    // Unwind author
    unwindAuthor: { $unwind: '$author' },

    // Add engagement counts
    addEngagementCounts: {
        $addFields: {
            likesCount: { $size: { $ifNull: ['$likes', []] } },
            dislikesCount: { $size: { $ifNull: ['$dislikes', []] } },
            repostsCount: { $size: { $ifNull: ['$reposts', []] } },
        },
    },

    // Project tweet fields (without arrays)
    projectTweetFields: {
        $project: {
            likes: 0,
            dislikes: 0,
            reposts: 0,
            author: {
                _id: 1,
                userName: 1,
                fullName: 1,
                avatar: 1,
            },
        },
    },

    // Project tweet fields with role (for moderation)
    projectTweetFieldsWithRole: {
        $project: {
            likes: 0,
            dislikes: 0,
            reposts: 0,
            author: {
                _id: 1,
                userName: 1,
                fullName: 1,
                avatar: 1,
                role: 1,
            },
        },
    },

    // Comments lookup
    commentsLookup: {
        $lookup: {
            from: 'comments',
            localField: '_id',
            foreignField: 'commentable',
            as: 'comments',
        },
    },

    // Comment authors lookup
    commentAuthorsLookup: {
        $lookup: {
            from: 'users',
            localField: 'comments.author',
            foreignField: '_id',
            as: 'commentAuthors',
        },
    },

    // Add comment authors
    addCommentAuthors: {
        $addFields: {
            'comments.author': {
                $map: {
                    input: '$comments',
                    as: 'comment',
                    in: {
                        $mergeObjects: [
                            '$$comment',
                            {
                                author: {
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: '$commentAuthors',
                                                as: 'author',
                                                cond: {
                                                    $eq: [
                                                        '$$author._id',
                                                        '$$comment.author',
                                                    ],
                                                },
                                            },
                                        },
                                        0,
                                    ],
                                },
                            },
                        ],
                    },
                },
            },
        },
    },

    // Project comment fields
    projectCommentFields: {
        $project: {
            commentAuthors: 0,
            'comments.author': {
                _id: 1,
                userName: 1,
                fullName: 1,
                avatar: 1,
            },
        },
    },

    // Pagination facet
    createPaginationFacet: (sortOptions, skip, limit) => ({
        $facet: {
            tweets: [
                { $sort: sortOptions },
                { $skip: skip },
                { $limit: limit },
            ],
            totalCount: [{ $count: 'count' }],
        },
    }),
};

// Helper function to create common aggregation pipeline for tweet population
const createTweetAggregationPipeline = (tweetId, includeComments = false) => {
    if (!tweetId) {
        throw new ApiError(
            400,
            'Tweet ID is required for aggregation pipeline',
        );
    }

    const pipeline = [
        { $match: { _id: tweetId } },
        AGGREGATION_STAGES.authorLookup,
        AGGREGATION_STAGES.unwindAuthor,
        AGGREGATION_STAGES.addEngagementCounts,
        AGGREGATION_STAGES.projectTweetFields,
    ];

    if (includeComments) {
        pipeline.splice(
            3,
            0,
            AGGREGATION_STAGES.commentsLookup,
            AGGREGATION_STAGES.commentAuthorsLookup,
        );

        pipeline.splice(6, 0, AGGREGATION_STAGES.addCommentAuthors);
        pipeline.splice(7, 0, AGGREGATION_STAGES.projectCommentFields);
    }

    return pipeline;
};

// Helper function to create common aggregation pipeline for tweet lists
const createTweetListPipeline = (
    filter,
    sortOptions,
    skip,
    limit,
    includeRole = false,
) => {
    const pipeline = [
        { $match: filter },
        AGGREGATION_STAGES.authorLookup,
        AGGREGATION_STAGES.unwindAuthor,
        AGGREGATION_STAGES.addEngagementCounts,
        includeRole
            ? AGGREGATION_STAGES.projectTweetFieldsWithRole
            : AGGREGATION_STAGES.projectTweetFields,
        AGGREGATION_STAGES.createPaginationFacet(sortOptions, skip, limit),
    ];

    return pipeline;
};

// Helper function to build search filter
const buildSearchFilter = (searchTerm) => {
    if (!searchTerm) return null;

    const sanitized = sanitizeSearchInput(searchTerm);
    if (!sanitized) return null;

    if (sanitized.length >= 3) {
        // Use text search for substantial search terms (better performance)
        return { $text: { $search: sanitized } };
    } else {
        // Use regex for short search terms
        return {
            $or: [
                { title: { $regex: sanitized, $options: 'i' } },
                { description: { $regex: sanitized, $options: 'i' } },
                { tags: { $in: [new RegExp(sanitized, 'i')] } },
            ],
        };
    }
};

// Helper function to determine tweet status based on user role and content
const determineTweetStatus = (userRole, status, isSensitive) => {
    if (userRole === userRoles.ADMIN) {
        return validateStatus(status) || tweetStatuses.PUBLISHED;
    } else if (userRole === userRoles.MODERATOR) {
        return validateStatus(status) || tweetStatuses.AWAITING_APPROVAL;
    } else if (isSensitive && userRole !== userRoles.ADMIN) {
        // User always gets awaiting_approval regardless of what they send
        return tweetStatuses.AWAITING_APPROVAL;
    } else {
        return validateStatus(status) || tweetStatuses.AWAITING_APPROVAL;
    }
};

// Helper function to check update permissions
const checkUpdatePermissions = (tweet, userId, userRole) => {
    const isOwner = tweet.author.toString() === userId.toString();
    const isAdmin = userRole === userRoles.ADMIN;
    const isModerator = userRole === userRoles.MODERATOR;

    return { isOwner, isAdmin, isModerator };
};

// Helper function to update tweet fields
const updateTweetFields = (tweet, updates) => {
    const { title, description, tags, isSensitive } = updates;

    if (title?.trim()) tweet.title = title.trim();
    if (description?.trim()) tweet.description = description.trim();
    if (tags) tweet.tags = processTags(tags);
    if (typeof isSensitive === 'boolean') tweet.isSensitive = isSensitive;

    return tweet;
};

// Helper function to get populated tweet
const getPopulatedTweet = async (tweetId, includeComments = false) => {
    const pipeline = createTweetAggregationPipeline(tweetId, includeComments);
    const result = await Tweet.aggregate(pipeline);
    return handleAggregationResult(result, 'Tweet not found');
};

// Helper function to create pagination response
const createPaginationResponse = (data, page, limit, totalCount, message) => {
    const totalPages = Math.ceil(totalCount / limit);

    return new ApiResponse(
        200,
        {
            ...data,
            pagination: {
                page,
                limit,
                totalPages,
                totalCount,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        },
        message,
    );
};

/**
 * Create a new tweet
 * @route POST /api/v1/tweet/createTweet
 * @access Private (authenticated users)
 */
const createTweet = asyncHandler(async (req, res) => {
    const { title, description, tags, status, isSensitive, author } = req.body;
    const currentUserId = req.user._id;
    const userRole = req.user.role;

    // Validate required fields
    if (!title?.trim()) {
        throw new ApiError(400, 'Title is required');
    }
    if (!description?.trim()) {
        throw new ApiError(400, 'Description is required');
    }

    // Determine the author of the tweet
    let authorId = currentUserId;

    // Only admin can create tweets for other users
    if (author && userRole === userRoles.ADMIN) {
        authorId = validateAuthorId(author);
    } else if (author && userRole !== userRoles.ADMIN) {
        throw new ApiError(403, 'Only admin can create tweets for other users');
    }

    // Determine tweet status based on role and content
    let tweetStatus = determineTweetStatus(userRole, status, isSensitive);

    // Handle image upload if provided
    const imageUrl = await handleImageUpload(req, null);

    // Create tweet
    const tweet = await Tweet.create({
        title: title.trim(),
        description: description.trim(),
        image: imageUrl,
        status: tweetStatus,
        isSensitive: isSensitive || false,
        tags: processTags(tags),
        author: authorId,
    });

    // Get populated tweet
    const populatedTweet = await getPopulatedTweet(tweet._id);

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                { tweet: populatedTweet },
                'Tweet created successfully',
            ),
        );
});

/**
 * Get all tweets with pagination and filtering
 * @route GET /api/v1/tweet/getAllTweets
 * @access Public
 */
const getAllTweets = asyncHandler(async (req, res) => {
    const {
        status,
        author,
        search,
        sortBy = '-createdAt',
        page,
        limit,
    } = req.query;

    // Validate and sanitize pagination parameters
    const { page: pageNum, limit: limitNum } = validatePaginationParams(
        page,
        limit,
        100,
    );

    // Build filter object
    const filter = {};

    // Filter by status
    if (status) {
        validateStatus(status);
        filter.status = status;
    } else {
        // By default, show only published tweets for public access
        filter.status = tweetStatuses.PUBLISHED;
    }

    // Filter by author
    if (author) {
        filter.author = validateAuthorId(author);
    }

    // Search functionality
    const searchFilter = buildSearchFilter(search);
    if (searchFilter) {
        Object.assign(filter, searchFilter);
    }

    // Build sort object
    const sortOptions = buildSortOptions(sortBy);

    // Calculate pagination
    const skip = (pageNum - 1) * limitNum;

    // Execute query with pagination using aggregation
    const pipeline = createTweetListPipeline(
        filter,
        sortOptions,
        skip,
        limitNum,
    );
    const result = await Tweet.aggregate(pipeline);

    const tweets = result[0].tweets;
    const totalTweets = result[0].totalCount[0]?.count || 0;

    return res
        .status(200)
        .json(
            createPaginationResponse(
                { tweets },
                pageNum,
                limitNum,
                totalTweets,
                'Tweets fetched successfully',
            ),
        );
});

/**
 * Get tweet by ID
 * @route GET /api/v1/tweet/getTweetById/:id
 * @access Public
 */
const getTweetById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const tweetId = validateTweetId(id);

    const tweetData = await getPopulatedTweet(tweetId, true);

    // Check if user can view this tweet (public can only see published tweets)
    if (!canViewTweet(tweetData, req.user)) {
        throw new ApiError(
            403,
            'You do not have permission to view this tweet',
        );
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { tweet: tweetData },
                'Tweet fetched successfully',
            ),
        );
});

/**
 * Get user's own tweets
 * @route GET /api/v1/tweet/getMyTweets
 * @access Private
 */
const getMyTweets = asyncHandler(async (req, res) => {
    const { status, sortBy = '-createdAt', page, limit } = req.query;
    const authorId = req.user._id;

    // Validate and sanitize pagination parameters
    const { page: pageNum, limit: limitNum } = validatePaginationParams(
        page,
        limit,
        100,
    );

    // Build filter object
    const filter = { author: authorId };

    // Filter by status
    if (status) {
        validateStatus(status);
        filter.status = status;
    }

    // Build sort object
    const sortOptions = buildSortOptions(sortBy);

    // Calculate pagination
    const skip = (pageNum - 1) * limitNum;

    const pipeline = createTweetListPipeline(
        filter,
        sortOptions,
        skip,
        limitNum,
    );
    const result = await Tweet.aggregate(pipeline);

    const tweets = result[0].tweets;
    const totalTweets = result[0].totalCount[0]?.count || 0;

    return res
        .status(200)
        .json(
            createPaginationResponse(
                { tweets },
                pageNum,
                limitNum,
                totalTweets,
                'Your tweets fetched successfully',
            ),
        );
});

/**
 * Update tweet (own tweet or admin/moderator can update any)
 * @route PATCH /api/v1/tweet/updateTweet/:id
 * @access Private
 */
const updateTweet = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, description, tags, status, isSensitive } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;

    const tweetId = validateTweetId(id);

    // Find the tweet
    const targetTweet = await Tweet.findById(tweetId);
    if (!targetTweet) {
        throw new ApiError(404, 'Tweet not found');
    }

    const { isOwner, isAdmin, isModerator } = checkUpdatePermissions(
        targetTweet,
        userId,
        userRole,
    );

    // --- USER: Can only update own tweet, cannot set status, always awaiting_approval ---
    if (userRole === userRoles.USER) {
        if (!isOwner) {
            throw new ApiError(403, 'You can only update your own tweets');
        }

        // Update fields
        updateTweetFields(targetTweet, {
            title,
            description,
            tags,
            isSensitive,
        });

        // Handle image upload
        const imageUrl = await handleImageUpload(req, targetTweet.image);
        if (imageUrl !== undefined) targetTweet.image = imageUrl;

        // Always set status to awaiting_approval
        targetTweet.status = tweetStatuses.AWAITING_APPROVAL;
        await targetTweet.save();

        // Get populated tweet
        const updatedTweet = await getPopulatedTweet(targetTweet._id);

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { tweet: updatedTweet },
                    'Tweet updated successfully',
                ),
            );
    }

    // --- MODERATOR: Can update own tweet (fields only), can set status for others ---
    if (userRole === userRoles.MODERATOR) {
        if (isOwner) {
            // Update fields
            updateTweetFields(targetTweet, {
                title,
                description,
                tags,
                isSensitive,
            });

            // Handle image upload
            const imageUrl = await handleImageUpload(req, targetTweet.image);
            if (imageUrl !== undefined) targetTweet.image = imageUrl;

            // Always set status to awaiting_approval
            targetTweet.status = tweetStatuses.AWAITING_APPROVAL;
        } else {
            // Can only set status for others' tweets
            validateStatus(status);
            // If sensitive, only allow awaiting_approval
            if (targetTweet.isSensitive && status === tweetStatuses.PUBLISHED) {
                throw new ApiError(
                    400,
                    'Sensitive content must be approved by admin before publishing',
                );
            }
            targetTweet.status = status;
        }

        await targetTweet.save();

        // Get populated tweet
        const updatedTweet = await getPopulatedTweet(targetTweet._id);

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { tweet: updatedTweet },
                    'Tweet updated successfully',
                ),
            );
    }

    // --- ADMIN: Can update any tweet, any field, any status ---
    if (isAdmin) {
        updateTweetFields(targetTweet, {
            title,
            description,
            tags,
            isSensitive,
        });

        // Handle image upload
        const imageUrl = await handleImageUpload(req, targetTweet.image);
        if (imageUrl !== undefined) targetTweet.image = imageUrl;

        if (status) {
            targetTweet.status = validateStatus(status);
        }

        await targetTweet.save();

        // Get populated tweet
        const updatedTweet = await getPopulatedTweet(targetTweet._id);

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { tweet: updatedTweet },
                    'Tweet updated successfully',
                ),
            );
    }

    throw new ApiError(403, 'You do not have permission to update this tweet');
});

/**
 * Update tweet status (admin/moderator only)
 * @route PATCH /api/v1/tweet/updateTweetStatus/:id
 * @access Private (admin/moderator)
 */
const updateTweetStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const userRole = req.user.role;

    const tweetId = validateTweetId(id);
    validateStatus(status);

    // Check permissions
    if (userRole !== userRoles.ADMIN && userRole !== userRoles.MODERATOR) {
        throw new ApiError(
            403,
            'Only admin and moderator can update tweet status',
        );
    }

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, 'Tweet not found');
    }

    tweet.status = status;
    await tweet.save();

    // Get populated tweet
    const updatedTweet = await getPopulatedTweet(tweet._id);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { tweet: updatedTweet },
                'Tweet status updated successfully',
            ),
        );
});

/**
 * Delete tweet (own tweet or admin can delete any)
 * @route DELETE /api/v1/tweet/deleteTweet/:id?
 * @access Private
 */
const deleteTweet = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    const tweetId = validateTweetId(id);

    // Find the tweet
    const targetTweet = await Tweet.findById(tweetId);
    if (!targetTweet) {
        throw new ApiError(404, 'Tweet not found');
    }

    // Check permissions
    const isOwner = targetTweet.author.toString() === userId.toString();
    const isAdmin = userRole === userRoles.ADMIN;

    if (!isOwner && !isAdmin) {
        throw new ApiError(403, 'You can only delete your own tweets');
    }

    // Delete image from Cloudinary if exists
    if (targetTweet.image) {
        await deleteImage(targetTweet.image);
    }

    // Delete the tweet
    await Tweet.findByIdAndDelete(tweetId);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, 'Tweet deleted successfully'));
});

/**
 * Like/Unlike tweet
 * @route POST /api/v1/tweet/likeTweet/:id
 * @access Private
 */
const likeTweet = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const tweetId = validateTweetId(id);

    // Check if tweet exists and get current like status efficiently
    const tweetStatus = await Tweet.aggregate([
        { $match: { _id: tweetId } },
        {
            $addFields: {
                isLiked: { $in: [userId, { $ifNull: ['$likes', []] }] },
                isDisliked: { $in: [userId, { $ifNull: ['$dislikes', []] }] },
                likesCount: { $size: { $ifNull: ['$likes', []] } },
                dislikesCount: { $size: { $ifNull: ['$dislikes', []] } },
            },
        },
        {
            $project: {
                isLiked: 1,
                isDisliked: 1,
                likesCount: 1,
                dislikesCount: 1,
            },
        },
    ]);

    if (!tweetStatus || tweetStatus.length === 0) {
        throw new ApiError(404, 'Tweet not found');
    }

    const { isLiked, isDisliked, likesCount, dislikesCount } = tweetStatus[0];

    // Build update operation
    let updateOperation;
    if (isLiked) {
        // Unlike the tweet
        updateOperation = {
            $pull: { likes: userId },
        };
    } else {
        // Like the tweet and remove from dislikes if previously disliked
        updateOperation = {
            $addToSet: { likes: userId },
            ...(isDisliked && { $pull: { dislikes: userId } }),
        };
    }

    // Update the tweet using MongoDB operations
    await Tweet.findByIdAndUpdate(tweetId, updateOperation, {
        new: true,
        runValidators: true,
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                isLiked: !isLiked,
                likesCount: isLiked ? likesCount - 1 : likesCount + 1,
                dislikesCount:
                    isDisliked && !isLiked ? dislikesCount - 1 : dislikesCount,
            },
            isLiked ? 'Tweet unliked' : 'Tweet liked',
        ),
    );
});

/**
 * Dislike/Undislike tweet
 * @route POST /api/v1/tweet/dislikeTweet/:id
 * @access Private
 */
const dislikeTweet = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const tweetId = validateTweetId(id);

    // Check if tweet exists and get current dislike status efficiently
    const tweetStatus = await Tweet.aggregate([
        { $match: { _id: tweetId } },
        {
            $addFields: {
                isDisliked: { $in: [userId, { $ifNull: ['$dislikes', []] }] },
                isLiked: { $in: [userId, { $ifNull: ['$likes', []] }] },
                likesCount: { $size: { $ifNull: ['$likes', []] } },
                dislikesCount: { $size: { $ifNull: ['$dislikes', []] } },
            },
        },
        {
            $project: {
                isDisliked: 1,
                isLiked: 1,
                likesCount: 1,
                dislikesCount: 1,
            },
        },
    ]);

    if (!tweetStatus || tweetStatus.length === 0) {
        throw new ApiError(404, 'Tweet not found');
    }

    const { isDisliked, isLiked, likesCount, dislikesCount } = tweetStatus[0];

    // Build update operation
    let updateOperation;
    if (isDisliked) {
        // Undislike the tweet
        updateOperation = {
            $pull: { dislikes: userId },
        };
    } else {
        // Dislike the tweet and remove from likes if previously liked
        updateOperation = {
            $addToSet: { dislikes: userId },
            ...(isLiked && { $pull: { likes: userId } }),
        };
    }

    // Update the tweet using MongoDB operations
    await Tweet.findByIdAndUpdate(tweetId, updateOperation, {
        new: true,
        runValidators: true,
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                isDisliked: !isDisliked,
                likesCount:
                    isLiked && !isDisliked ? likesCount - 1 : likesCount,
                dislikesCount: isDisliked
                    ? dislikesCount - 1
                    : dislikesCount + 1,
            },
            isDisliked ? 'Tweet undisliked' : 'Tweet disliked',
        ),
    );
});

/**
 * Repost tweet
 * @route POST /api/v1/tweet/repostTweet/:id
 * @access Private
 */
const repostTweet = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const tweetId = validateTweetId(id);

    // Check if tweet exists and get current repost status efficiently
    const tweetStatus = await Tweet.aggregate([
        { $match: { _id: tweetId } },
        {
            $addFields: {
                isReposted: { $in: [userId, { $ifNull: ['$reposts', []] }] },
                repostsCount: { $size: { $ifNull: ['$reposts', []] } },
            },
        },
        {
            $project: {
                isReposted: 1,
                repostsCount: 1,
            },
        },
    ]);

    if (!tweetStatus || tweetStatus.length === 0) {
        throw new ApiError(404, 'Tweet not found');
    }

    const { isReposted, repostsCount } = tweetStatus[0];

    // Use MongoDB operations for better performance
    const updateOperation = isReposted
        ? { $pull: { reposts: userId } }
        : { $addToSet: { reposts: userId } };

    await Tweet.findByIdAndUpdate(tweetId, updateOperation, {
        new: true,
        runValidators: true,
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                isReposted: !isReposted,
                repostsCount: isReposted ? repostsCount - 1 : repostsCount + 1,
            },
            isReposted ? 'Repost removed' : 'Tweet reposted',
        ),
    );
});

/**
 * Get tweets for moderation (admin/moderator only)
 * @route GET /api/v1/tweet/moderate
 * @access Private (admin/moderator only)
 */
const getTweetModeration = asyncHandler(async (req, res) => {
    const { author, status, isSensitive, search, page, limit } = req.query;
    const currentUserId = req.user._id;
    const userRole = req.user.role;

    // Validate and sanitize pagination parameters
    const { page: pageNum, limit: limitNum } = validatePaginationParams(
        page,
        limit,
        100,
    );

    // Check permissions
    if (userRole !== userRoles.ADMIN && userRole !== userRoles.MODERATOR) {
        throw new ApiError(
            403,
            'Only admin and moderator can access tweet moderation',
        );
    }

    // Build filter object
    const filter = {};

    // Exclude own tweets if admin, exclude admin tweets if moderator
    if (userRole === userRoles.ADMIN) {
        filter.author = { $ne: currentUserId };
    } else if (userRole === userRoles.MODERATOR) {
        // Use cached admin user IDs for better performance
        const adminUserIds = await getAdminUserIds();
        filter.author = {
            $nin: [currentUserId, ...adminUserIds],
        };
    }

    // Apply search filters
    if (author) {
        filter.author = validateAuthorId(author);
    }
    if (status) {
        validateStatus(status);
        filter.status = status;
    }
    const isSensitiveValue = validateBooleanParam(isSensitive);
    if (isSensitiveValue !== undefined) {
        filter.isSensitive = isSensitiveValue;
    }

    const searchFilter = buildSearchFilter(search);
    if (searchFilter) {
        Object.assign(filter, searchFilter);
    }

    // Calculate pagination
    const skip = (pageNum - 1) * limitNum;

    // Get tweets with pagination using aggregation
    const pipeline = createTweetListPipeline(
        filter,
        { createdAt: -1 },
        skip,
        limitNum,
        true,
    );
    const result = await Tweet.aggregate(pipeline);

    const tweets = result[0].tweets;
    const totalTweets = result[0].totalCount[0]?.count || 0;

    return res
        .status(200)
        .json(
            createPaginationResponse(
                { tweets },
                pageNum,
                limitNum,
                totalTweets,
                'Tweets fetched for moderation successfully',
            ),
        );
});

/**
 * Get users who liked a tweet
 * @route GET /api/v1/tweet/:id/likes
 * @access Public
 */
const getTweetLikes = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { page, limit } = req.query;

    const tweetId = validateTweetId(id);
    const { page: pageNum, limit: limitNum } = validatePaginationParams(
        page,
        limit,
        50,
    );

    // Use aggregation for better performance
    const tweet = await Tweet.aggregate([
        { $match: { _id: tweetId } },
        AGGREGATION_STAGES.authorLookup,
        AGGREGATION_STAGES.unwindAuthor,
        {
            $addFields: {
                totalLikes: { $size: { $ifNull: ['$likes', []] } },
            },
        },
    ]);

    if (!tweet || tweet.length === 0) {
        throw new ApiError(404, 'Tweet not found');
    }

    const tweetData = tweet[0];

    // Check if user can view this tweet
    if (!canViewTweet(tweetData, req.user)) {
        throw new ApiError(
            403,
            'You do not have permission to view this tweet',
        );
    }

    // Calculate pagination
    const skip = (pageNum - 1) * limitNum;
    const totalLikes = tweetData.totalLikes;

    // Get paginated user details using aggregation instead of array slicing
    const users = await User.aggregate([
        { $match: { _id: { $in: tweetData.likes || [] } } },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limitNum },
        {
            $project: {
                userName: 1,
                fullName: 1,
                avatar: 1,
            },
        },
    ]);

    return res
        .status(200)
        .json(
            createPaginationResponse(
                { users },
                pageNum,
                limitNum,
                totalLikes,
                'Tweet likes fetched successfully',
            ),
        );
});

/**
 * Get users who disliked a tweet
 * @route GET /api/v1/tweet/:id/dislikes
 * @access Public
 */
const getTweetDislikes = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { page, limit } = req.query;

    const tweetId = validateTweetId(id);
    const { page: pageNum, limit: limitNum } = validatePaginationParams(
        page,
        limit,
        50,
    );

    // Use aggregation for better performance
    const tweet = await Tweet.aggregate([
        { $match: { _id: tweetId } },
        AGGREGATION_STAGES.authorLookup,
        AGGREGATION_STAGES.unwindAuthor,
        {
            $addFields: {
                totalDislikes: { $size: { $ifNull: ['$dislikes', []] } },
            },
        },
    ]);

    if (!tweet || tweet.length === 0) {
        throw new ApiError(404, 'Tweet not found');
    }

    const tweetData = tweet[0];

    // Check if user can view this tweet
    if (!canViewTweet(tweetData, req.user)) {
        throw new ApiError(
            403,
            'You do not have permission to view this tweet',
        );
    }

    // Calculate pagination
    const skip = (pageNum - 1) * limitNum;
    const totalDislikes = tweetData.totalDislikes;

    // Get paginated user details using aggregation instead of array slicing
    const users = await User.aggregate([
        { $match: { _id: { $in: tweetData.dislikes || [] } } },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limitNum },
        {
            $project: {
                userName: 1,
                fullName: 1,
                avatar: 1,
            },
        },
    ]);

    return res
        .status(200)
        .json(
            createPaginationResponse(
                { users },
                pageNum,
                limitNum,
                totalDislikes,
                'Tweet dislikes fetched successfully',
            ),
        );
});

/**
 * Get users who reposted a tweet
 * @route GET /api/v1/tweet/:id/reposts
 * @access Public
 */
const getTweetReposts = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { page, limit } = req.query;

    const tweetId = validateTweetId(id);
    const { page: pageNum, limit: limitNum } = validatePaginationParams(
        page,
        limit,
        50,
    );

    // Use aggregation for better performance
    const tweet = await Tweet.aggregate([
        { $match: { _id: tweetId } },
        AGGREGATION_STAGES.authorLookup,
        AGGREGATION_STAGES.unwindAuthor,
        {
            $addFields: {
                totalReposts: { $size: { $ifNull: ['$reposts', []] } },
            },
        },
    ]);

    if (!tweet || tweet.length === 0) {
        throw new ApiError(404, 'Tweet not found');
    }

    const tweetData = tweet[0];

    // Check if user can view this tweet
    if (!canViewTweet(tweetData, req.user)) {
        throw new ApiError(
            403,
            'You do not have permission to view this tweet',
        );
    }

    // Calculate pagination
    const skip = (pageNum - 1) * limitNum;
    const totalReposts = tweetData.totalReposts;

    // Get paginated user details using aggregation instead of array slicing
    const users = await User.aggregate([
        { $match: { _id: { $in: tweetData.reposts || [] } } },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limitNum },
        {
            $project: {
                userName: 1,
                fullName: 1,
                avatar: 1,
            },
        },
    ]);

    return res
        .status(200)
        .json(
            createPaginationResponse(
                { users },
                pageNum,
                limitNum,
                totalReposts,
                'Tweet reposts fetched successfully',
            ),
        );
});

export {
    createTweet,
    getAllTweets,
    getTweetById,
    getMyTweets,
    updateTweet,
    updateTweetStatus,
    deleteTweet,
    likeTweet,
    dislikeTweet,
    repostTweet,
    getTweetModeration,
    getTweetLikes,
    getTweetDislikes,
    getTweetReposts,
    invalidateAdminCache,
};
