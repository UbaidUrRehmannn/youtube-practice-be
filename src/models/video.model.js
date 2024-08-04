import { Schema, modal } from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
const videoSchema = new Schema(
    {
        videoFile: {
            type: String, // it will be video but we upload it to server and store image url as string
            required: true 
        },
        thumbnail: {
            type: String, // it will be image but we upload it to server and store image url as string
            required: true 
        },
        title: {
            type: String,
            required: true 
        },
        description: {
            type: String,
            required: true
        },
        duration: {
            type: Number, // duration will be provided by server on which we upload file
            required: true
        },
        views: {
            type: Number,
            default: 0
        },
        ispublished: {
            type: Boolean,
            default: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    { timestamps: true },
);

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = modal('Video', videoSchema);
