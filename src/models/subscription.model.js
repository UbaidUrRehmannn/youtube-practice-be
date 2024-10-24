import { Schema, modal } from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

/* 
* follow the link to see detail desciption about this document
* https://app.eraser.io/workspace/vUC34CQ5WEcvsfc7ew9u?origin=share
*/
const subscriptionSchema = new Schema(
    {
        subscriber: {
            type: Schema.Types.ObjectId, // one who is sunscribing
            ref: 'User',
            required: true 
        },
        channel: {
            type: Schema.Types.ObjectId, // Also user as each channel is treated as user and it is what to whom subscriber is subscribing to
            ref: 'User',
            required: true 
        },
        
    },
    { timestamps: true },
);

subscriptionSchema.plugin(mongooseAggregatePaginate)

export const Subscription = modal('Subscription', subscriptionSchema);
