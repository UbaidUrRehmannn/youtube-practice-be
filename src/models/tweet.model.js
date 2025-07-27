import { Schema, model } from 'mongoose';
import { tweetStatuses } from '../constant.js';

const tweetSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
            // Support for rich text content (HTML/markdown)
        },
        image: {
            type: String,
            // Optional image URL from Cloudinary
        },
        status: {
            type: String,
            enum: Object.values(tweetStatuses),
            default: tweetStatuses.AWAITING_APPROVAL,
            index: true,
        },
        isSensitive: {
            type: Boolean,
            default: false,
            index: true,
            description: 'Marks if the tweet contains sensitive content (separate from moderation status)'
        },
        tags: [
            {
                type: String,
                trim: true,
                index: true,
            },
        ],
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        likes: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        dislikes: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        reposts: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        comments: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Comment',
            },
        ],
    },
    { timestamps: true },
);

// Index for better query performance
tweetSchema.index({ author: 1, status: 1, createdAt: -1 });
tweetSchema.index({ status: 1, createdAt: -1 });
tweetSchema.index({ isSensitive: 1, status: 1, createdAt: -1 });

// Additional indexes for aggregation optimization
tweetSchema.index({ title: 'text', description: 'text', tags: 'text' }); // Text search index
tweetSchema.index({ author: 1, createdAt: -1 }); // For getMyTweets
tweetSchema.index({ status: 1, author: 1, createdAt: -1 }); // For moderation queries
tweetSchema.index({ likes: 1 }); // For like operations
tweetSchema.index({ dislikes: 1 }); // For dislike operations
tweetSchema.index({ reposts: 1 }); // For repost operations

export const Tweet = model('Tweet', tweetSchema);
