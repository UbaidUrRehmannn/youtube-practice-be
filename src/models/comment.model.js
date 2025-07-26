import { Schema, model } from 'mongoose';

const commentSchema = new Schema(
    {
        content: { type: String, required: true },
        owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        commentable: {
            type: Schema.Types.ObjectId,
            required: true,
            refPath: 'onModel',
        },
        onModel: {
            type: String,
            required: true,
            enum: ['Video', 'Tweet'],
        },
    },
    { timestamps: true }
);

export const Comment = model('Comment', commentSchema);