import { Tweet } from '../models/tweet.model.js';
import { User } from '../models/user.model.js';
import ApiError from '../utils/errorhandler.js';
import asyncHandler from '../utils/asynchandler.js';
import { uploadImage, deleteImage, removeLocalFile } from '../utils/cloudinary.js';
import ApiResponse from '../utils/responsehandler.js';
import { tweetStatuses, userRoles } from '../constant.js';
import mongoose from 'mongoose';

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
        if (!mongoose.Types.ObjectId.isValid(author)) {
            throw new ApiError(400, 'Invalid author ID');
        }
        authorId = author;
    } else if (author && userRole !== userRoles.ADMIN) {
        throw new ApiError(403, 'Only admin can create tweets for other users');
    }

    // Determine tweet status based on role and content
    let tweetStatus;
    if (userRole === userRoles.ADMIN) {
        // Admin can set any status, default to published
        if (status && Object.values(tweetStatuses).includes(status)) {
            tweetStatus = status;
        } else {
            tweetStatus = tweetStatuses.PUBLISHED;
        }
    } else if (userRole === userRoles.MODERATOR) {
        // Moderator can set any status, but sensitive content goes to awaiting approval
        if (status && Object.values(tweetStatuses).includes(status)) {
            tweetStatus = status;
        } else {
            tweetStatus = tweetStatuses.AWAITING_APPROVAL;
        }
    } else {
        // User always gets awaiting_approval regardless of what they send
        tweetStatus = tweetStatuses.AWAITING_APPROVAL;
    }

    // Handle sensitive content logic
    const isSensitiveContent = isSensitive || false;
    
    // If content is sensitive, override status to awaiting_approval (except for admin)
    if (isSensitiveContent && userRole !== userRoles.ADMIN) {
        tweetStatus = tweetStatuses.AWAITING_APPROVAL;
    }

    // Handle image upload if provided
    let imageUrl = null;
    if (req.file) {
        const localFilePath = req.file.path;
        
        // Validate image type (webp)
        const fileMimeType = req.file.mimetype;
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
        imageUrl = uploadedImage.url;
        removeLocalFile(localFilePath);
    }

    // Create tweet
    const tweet = await Tweet.create({
        title: title.trim(),
        description: description.trim(),
        image: imageUrl,
        status: tweetStatus,
        isSensitive: isSensitiveContent,
        tags: tags ? tags.map(tag => tag.trim()).filter(tag => tag) : [],
        author: authorId,
    });

    // Populate author details
    await tweet.populate('author', 'userName fullName avatar');

    return res.status(201).json(
        new ApiResponse(201, { tweet }, 'Tweet created successfully')
    );
});

/**
 * Get all tweets with pagination and filtering
 * @route GET /api/v1/tweet/getAllTweets
 * @access Public
 */
const getAllTweets = asyncHandler(async (req, res) => {
    const { status, author, search, sortBy = '-createdAt' } = req.query;

    // Build filter object
    const filter = {};

    // Filter by status
    if (status) {
        if (!Object.values(tweetStatuses).includes(status)) {
            throw new ApiError(400, 'Invalid status filter');
        }
        filter.status = status;
    } else {
        // By default, show only published tweets for public access
        filter.status = tweetStatuses.PUBLISHED;
    }

    // Filter by author
    if (author) {
        if (!mongoose.Types.ObjectId.isValid(author)) {
            throw new ApiError(400, 'Invalid author ID');
        }
        filter.author = author;
    }

    // Search functionality
    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { tags: { $in: [new RegExp(search, 'i')] } },
        ];
    }

    // Build sort object
    const sortOptions = {};
    if (sortBy.startsWith('-')) {
        sortOptions[sortBy.slice(1)] = -1;
    } else {
        sortOptions[sortBy] = 1;
    }

    // Execute query with pagination
    const tweets = await Tweet.find(filter)
        .populate('author', 'userName fullName avatar')
        .populate('likes', 'userName fullName avatar')
        .populate('dislikes', 'userName fullName avatar')
        .populate('reposts', 'userName fullName avatar')
        .sort(sortOptions);

    return res.status(200).json(
        new ApiResponse(200, { tweets }, 'Tweets fetched successfully')
    );
});

/**
 * Get tweet by ID
 * @route GET /api/v1/tweet/getTweetById/:id
 * @access Public
 */
const getTweetById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, 'Invalid tweet ID');
    }

    const tweet = await Tweet.findById(id)
        .populate('author', 'userName fullName avatar')
        .populate('likes', 'userName fullName avatar')
        .populate('dislikes', 'userName fullName avatar')
        .populate('reposts', 'userName fullName avatar')
        .populate({
            path: 'comments',
            populate: {
                path: 'author',
                select: 'userName fullName avatar'
            }
        });

    if (!tweet) {
        throw new ApiError(404, 'Tweet not found');
    }

    // Check if user can view this tweet (public can only see published tweets)
    if (tweet.status !== tweetStatuses.PUBLISHED && 
        (!req.user || (req.user._id.toString() !== tweet.author._id.toString() && 
         req.user.role !== userRoles.ADMIN && 
         req.user.role !== userRoles.MODERATOR))) {
        throw new ApiError(403, 'You do not have permission to view this tweet');
    }

    return res.status(200).json(
        new ApiResponse(200, { tweet }, 'Tweet fetched successfully')
    );
});

/**
 * Get user's own tweets
 * @route GET /api/v1/tweet/getMyTweets
 * @access Private
 */
const getMyTweets = asyncHandler(async (req, res) => {
    const { status, sortBy = '-createdAt' } = req.query;
    const authorId = req.user._id;

    // Build filter object
    const filter = { author: authorId };

    // Filter by status
    if (status) {
        if (!Object.values(tweetStatuses).includes(status)) {
            throw new ApiError(400, 'Invalid status filter');
        }
        filter.status = status;
    }

    // Build sort object
    const sortOptions = {};
    if (sortBy.startsWith('-')) {
        sortOptions[sortBy.slice(1)] = -1;
    } else {
        sortOptions[sortBy] = 1;
    }

    const tweets = await Tweet.find(filter)
        .populate('likes', 'userName fullName avatar')
        .populate('dislikes', 'userName fullName avatar')
        .populate('reposts', 'userName fullName avatar')
        .sort(sortOptions);

    return res.status(200).json(
        new ApiResponse(200, { tweets }, 'Your tweets fetched successfully')
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

    if (!id) {
        throw new ApiError(400, 'Tweet ID is required in URL parameter');
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, 'Invalid tweet ID');
    }

    // Find the tweet
    const targetTweet = await Tweet.findById(id);
    if (!targetTweet) {
        throw new ApiError(404, 'Tweet not found');
    }

    const isOwner = targetTweet.author.toString() === userId.toString();
    const isAdmin = userRole === userRoles.ADMIN;
    const isModerator = userRole === userRoles.MODERATOR;

    // --- USER: Can only update own tweet, cannot set status, always awaiting_approval ---
    if (userRole === userRoles.USER) {
        if (!isOwner) {
            throw new ApiError(403, 'You can only update your own tweets');
        }
        // Only allow field updates, not status
        if (title?.trim()) targetTweet.title = title.trim();
        if (description?.trim()) targetTweet.description = description.trim();
        if (tags) targetTweet.tags = tags.map(tag => tag.trim()).filter(tag => tag);
        if (typeof isSensitive === 'boolean') targetTweet.isSensitive = isSensitive;
        // Handle image upload if provided
        let imageUrl = targetTweet.image;
        if (req.file) {
            const localFilePath = req.file.path;
            const fileMimeType = req.file.mimetype;
            if (!fileMimeType.startsWith('image/')) {
                removeLocalFile(localFilePath);
                throw new ApiError(400, 'Only image files are allowed');
            }
            if (fileMimeType !== 'image/webp') {
                removeLocalFile(localFilePath);
                throw new ApiError(400, 'Only webp images are allowed');
            }
            const uploadedImage = await uploadImage(localFilePath);
            if (!uploadedImage?.url) {
                removeLocalFile(localFilePath);
                throw new ApiError(500, 'Error while uploading image');
            }
            imageUrl = uploadedImage.url;
            removeLocalFile(localFilePath);
            if (targetTweet.image) {
                await deleteImage(targetTweet.image);
            }
        }
        if (imageUrl !== undefined) targetTweet.image = imageUrl;
        // Always set status to awaiting_approval
        targetTweet.status = tweetStatuses.AWAITING_APPROVAL;
        await targetTweet.save();
        await targetTweet.populate('author', 'userName fullName avatar');
        return res.status(200).json(
            new ApiResponse(200, { tweet: targetTweet }, 'Tweet updated successfully')
        );
    }

    // --- MODERATOR: Can update own tweet (fields only), can set status for others ---
    if (userRole === userRoles.MODERATOR) {
        if (isOwner) {
            // Only allow field updates, not status
            if (title?.trim()) targetTweet.title = title.trim();
            if (description?.trim()) targetTweet.description = description.trim();
            if (tags) targetTweet.tags = tags.map(tag => tag.trim()).filter(tag => tag);
            if (typeof isSensitive === 'boolean') targetTweet.isSensitive = isSensitive;
            // Handle image upload if provided
            let imageUrl = targetTweet.image;
            if (req.file) {
                const localFilePath = req.file.path;
                const fileMimeType = req.file.mimetype;
                if (!fileMimeType.startsWith('image/')) {
                    removeLocalFile(localFilePath);
                    throw new ApiError(400, 'Only image files are allowed');
                }
                if (fileMimeType !== 'image/webp') {
                    removeLocalFile(localFilePath);
                    throw new ApiError(400, 'Only webp images are allowed');
                }
                const uploadedImage = await uploadImage(localFilePath);
                if (!uploadedImage?.url) {
                    removeLocalFile(localFilePath);
                    throw new ApiError(500, 'Error while uploading image');
                }
                imageUrl = uploadedImage.url;
                removeLocalFile(localFilePath);
                if (targetTweet.image) {
                    await deleteImage(targetTweet.image);
                }
            }
            if (imageUrl !== undefined) targetTweet.image = imageUrl;
            // Always set status to awaiting_approval
            targetTweet.status = tweetStatuses.AWAITING_APPROVAL;
        } else {
            // Can only set status for others' tweets
            if (!status || !Object.values(tweetStatuses).includes(status)) {
                throw new ApiError(400, 'Valid status is required');
            }
            // If sensitive, only allow awaiting_approval
            if (targetTweet.isSensitive && status === tweetStatuses.PUBLISHED) {
                throw new ApiError(400, 'Sensitive content must be approved by admin before publishing');
            }
            targetTweet.status = status;
        }
        await targetTweet.save();
        await targetTweet.populate('author', 'userName fullName avatar');
        return res.status(200).json(
            new ApiResponse(200, { tweet: targetTweet }, 'Tweet updated successfully')
        );
    }

    // --- ADMIN: Can update any tweet, any field, any status ---
    if (isAdmin) {
        if (title?.trim()) targetTweet.title = title.trim();
        if (description?.trim()) targetTweet.description = description.trim();
        if (tags) targetTweet.tags = tags.map(tag => tag.trim()).filter(tag => tag);
        if (typeof isSensitive === 'boolean') targetTweet.isSensitive = isSensitive;
        // Handle image upload if provided
        let imageUrl = targetTweet.image;
        if (req.file) {
            const localFilePath = req.file.path;
            const fileMimeType = req.file.mimetype;
            if (!fileMimeType.startsWith('image/')) {
                removeLocalFile(localFilePath);
                throw new ApiError(400, 'Only image files are allowed');
            }
            if (fileMimeType !== 'image/webp') {
                removeLocalFile(localFilePath);
                throw new ApiError(400, 'Only webp images are allowed');
            }
            const uploadedImage = await uploadImage(localFilePath);
            if (!uploadedImage?.url) {
                removeLocalFile(localFilePath);
                throw new ApiError(500, 'Error while uploading image');
            }
            imageUrl = uploadedImage.url;
            removeLocalFile(localFilePath);
            if (targetTweet.image) {
                await deleteImage(targetTweet.image);
            }
        }
        if (imageUrl !== undefined) targetTweet.image = imageUrl;
        if (status && Object.values(tweetStatuses).includes(status)) {
            targetTweet.status = status;
        }
        await targetTweet.save();
        await targetTweet.populate('author', 'userName fullName avatar');
        return res.status(200).json(
            new ApiResponse(200, { tweet: targetTweet }, 'Tweet updated successfully')
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, 'Invalid tweet ID');
    }

    if (!status || !Object.values(tweetStatuses).includes(status)) {
        throw new ApiError(400, 'Valid status is required');
    }

    // Check permissions
    if (userRole !== userRoles.ADMIN && userRole !== userRoles.MODERATOR) {
        throw new ApiError(403, 'Only admin and moderator can update tweet status');
    }

    const tweet = await Tweet.findById(id);
    if (!tweet) {
        throw new ApiError(404, 'Tweet not found');
    }

    tweet.status = status;
    await tweet.save();

    await tweet.populate('author', 'userName fullName avatar');

    return res.status(200).json(
        new ApiResponse(200, { tweet }, 'Tweet status updated successfully')
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

    if (!id) {
        throw new ApiError(400, 'Tweet ID is required in URL parameter');
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, 'Invalid tweet ID');
    }

    // Find the tweet
    const targetTweet = await Tweet.findById(id);
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
    await Tweet.findByIdAndDelete(id);

    return res.status(200).json(
        new ApiResponse(200, {}, 'Tweet deleted successfully')
    );
});

/**
 * Like/Unlike tweet
 * @route POST /api/v1/tweet/likeTweet/:id
 * @access Private
 */
const likeTweet = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, 'Invalid tweet ID');
    }

    const tweet = await Tweet.findById(id);
    if (!tweet) {
        throw new ApiError(404, 'Tweet not found');
    }

    // Check if user already liked the tweet
    const isLiked = tweet.likes.includes(userId);
    const isDisliked = tweet.dislikes.includes(userId);

    if (isLiked) {
        // Unlike the tweet
        tweet.likes = tweet.likes.filter(likeId => likeId.toString() !== userId.toString());
    } else {
        // Like the tweet
        tweet.likes.push(userId);
        
        // Remove from dislikes if previously disliked
        if (isDisliked) {
            tweet.dislikes = tweet.dislikes.filter(dislikeId => dislikeId.toString() !== userId.toString());
        }
    }

    await tweet.save();

    return res.status(200).json(
        new ApiResponse(200, { 
            isLiked: !isLiked,
            likesCount: tweet.likes.length,
            dislikesCount: tweet.dislikes.length
        }, isLiked ? 'Tweet unliked' : 'Tweet liked')
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, 'Invalid tweet ID');
    }

    const tweet = await Tweet.findById(id);
    if (!tweet) {
        throw new ApiError(404, 'Tweet not found');
    }

    // Check if user already disliked the tweet
    const isDisliked = tweet.dislikes.includes(userId);
    const isLiked = tweet.likes.includes(userId);

    if (isDisliked) {
        // Undislike the tweet
        tweet.dislikes = tweet.dislikes.filter(dislikeId => dislikeId.toString() !== userId.toString());
    } else {
        // Dislike the tweet
        tweet.dislikes.push(userId);
        
        // Remove from likes if previously liked
        if (isLiked) {
            tweet.likes = tweet.likes.filter(likeId => likeId.toString() !== userId.toString());
        }
    }

    await tweet.save();

    return res.status(200).json(
        new ApiResponse(200, { 
            isDisliked: !isDisliked,
            likesCount: tweet.likes.length,
            dislikesCount: tweet.dislikes.length
        }, isDisliked ? 'Tweet undisliked' : 'Tweet disliked')
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, 'Invalid tweet ID');
    }

    const tweet = await Tweet.findById(id);
    if (!tweet) {
        throw new ApiError(404, 'Tweet not found');
    }

    // Check if user already reposted the tweet
    const isReposted = tweet.reposts.includes(userId);

    if (isReposted) {
        // Remove repost
        tweet.reposts = tweet.reposts.filter(repostId => repostId.toString() !== userId.toString());
    } else {
        // Add repost
        tweet.reposts.push(userId);
    }

    await tweet.save();

    return res.status(200).json(
        new ApiResponse(200, { 
            isReposted: !isReposted,
            repostsCount: tweet.reposts.length
        }, isReposted ? 'Repost removed' : 'Tweet reposted')
    );
});

/**
 * Get tweets for moderation (admin/moderator only)
 * @route GET /api/v1/tweet/moderate
 * @access Private (admin/moderator only)
 */
const getTweetModeration = asyncHandler(async (req, res) => {
    const { author, status, isSensitive, search, page = 1, limit = 10 } = req.query;
    const currentUserId = req.user._id;
    const userRole = req.user.role;

    // Check permissions
    if (userRole !== userRoles.ADMIN && userRole !== userRoles.MODERATOR) {
        throw new ApiError(403, 'Only admin and moderator can access tweet moderation');
    }

    // Build filter object
    const filter = {};

    // Exclude own tweets if admin, exclude admin tweets if moderator
    if (userRole === userRoles.ADMIN) {
        filter.author = { $ne: currentUserId };
    } else if (userRole === userRoles.MODERATOR) {
        // Exclude admin tweets and own tweets
        const adminUsers = await User.find({ role: userRoles.ADMIN }).select('_id');
        const adminUserIds = adminUsers.map(user => user._id);
        filter.author = { 
            $nin: [currentUserId, ...adminUserIds]
        };
    }

    // Apply search filters
    if (author && mongoose.Types.ObjectId.isValid(author)) {
        filter.author = author;
    }
    if (status && Object.values(tweetStatuses).includes(status)) {
        filter.status = status;
    }
    if (typeof isSensitive === 'boolean') {
        filter.isSensitive = isSensitive;
    }
    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { tags: { $in: [new RegExp(search, 'i')] } },
        ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const totalTweets = await Tweet.countDocuments(filter);
    const totalPages = Math.ceil(totalTweets / parseInt(limit));

    // Get tweets with pagination
    const tweets = await Tweet.find(filter)
        .populate('author', 'userName fullName avatar role')
        .populate('likes', 'userName fullName avatar')
        .populate('dislikes', 'userName fullName avatar')
        .populate('reposts', 'userName fullName avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    return res.status(200).json(
        new ApiResponse(200, {
            tweets,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages,
                totalTweets,
                hasNextPage: parseInt(page) < totalPages,
                hasPrevPage: parseInt(page) > 1
            }
        }, 'Tweets fetched for moderation successfully')
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
}; 