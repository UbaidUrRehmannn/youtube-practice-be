import { Router } from 'express';
import { upload } from '../middleware/multer.middleware.js';
import { 
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
    getTweetModeration
} from '../controllers/tweet.controller.js';
import paginationMiddleware from '../middleware/pagination.middleware.js';
import { Tweet } from '../models/tweet.model.js';
import { verifyJwt } from '../middleware/auth.middleware.js';

const router = Router();

// Public routes (no authentication required)
router.route('/getAllTweets').get(
    paginationMiddleware(Tweet, {
        select: '-__v',
        sort: '-createdAt',
        defaultLimit: 10,
        maxLimit: 50,
        populate: [
            { path: 'author', select: 'userName fullName avatar' },
            { path: 'likes', select: 'userName fullName avatar' },
            { path: 'dislikes', select: 'userName fullName avatar' },
            { path: 'reposts', select: 'userName fullName avatar' }
        ]
    }),
    getAllTweets
);

router.route('/getTweetById/:id').get(getTweetById);

// Protected routes (authentication required)
router.route('/createTweet').post(
    upload.single('image'),
    createTweet
);

router.route('/getMyTweets').get(
    paginationMiddleware(Tweet, {
        select: '-__v',
        sort: '-createdAt',
        defaultLimit: 10,
        maxLimit: 50,
        populate: [
            { path: 'likes', select: 'userName fullName avatar' },
            { path: 'dislikes', select: 'userName fullName avatar' },
            { path: 'reposts', select: 'userName fullName avatar' }
        ]
    }),
    getMyTweets
);

// Update tweet (own tweet or admin can update any)
router.route('/updateTweet/:id').patch(
    upload.single('image'),
    updateTweet
);

// Update tweet status (admin/moderator only)
router.route('/updateTweetStatus/:id').patch(updateTweetStatus);

// Delete tweet (own tweet or admin can delete any)
router.route('/deleteTweet/:id').delete(deleteTweet);

// Like/Unlike tweet
router.route('/likeTweet/:id').post(likeTweet);

// Dislike/Undislike tweet
router.route('/dislikeTweet/:id').post(dislikeTweet);

// Repost tweet
router.route('/repostTweet/:id').post(repostTweet);

// Tweet moderation endpoint (admin/moderator only)
router.route('/moderate').get(getTweetModeration);

export default router; 