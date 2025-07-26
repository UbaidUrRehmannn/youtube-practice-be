import { Schema, model } from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { envVariables } from '../constant.js';

const userSchema = new Schema(
    {
        userName: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            // if we want to enable search on any field we have to make index true in model
            index: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        avatar: {
            type: String, // it will be image but we upload it to server and store image url as string
            required: true,
        },
        coverImage: {
            type: String, // it will be image but we upload it to server and store image url as string
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Video',
            },
        ],
        password: {
            type: String,
            required: [true, 'Password is required'],
        },
        refreshToken: {
            type: String,
        },
        role: {
            type: String,
            enum: ['user', 'admin', 'moderator'],
            default: 'user',
        },
        isDisabled: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true },
);

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = async function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            userName: this.userName,
            fullName: this.fullName,
        },
        envVariables.accessTokenSecret,
        {
            expiresIn: envVariables.accessTokenExpiry,
        },
    );
};

userSchema.methods.generateRefreshToken = async function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            userName: this.userName,
            fullName: this.fullName,
        },
        envVariables.refreshTokenSecret,
        {
            expiresIn: envVariables.refreshTokenExpiry,
        },
    );
};

export const User = model('User', userSchema);
