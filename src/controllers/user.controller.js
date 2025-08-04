import bcrypt from 'bcrypt';
import { User } from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import ApiError from '../utils/errorhandler.js';
import asyncHandler from '../utils/asynchandler.js';
import {
    uploadImage,
    deleteImage,
    removeLocalFile,
} from '../utils/cloudinary.js';
import ApiResponse from '../utils/responsehandler.js';
import { generateAccessAndRefreshToken } from '../utils/common.js';
import { isValidEmail, isEmpty } from '../utils/validationUtils.js';
import constant, { envVariables, userRoles } from '../constant.js';
import mongoose from 'mongoose';

const getMsFromEnv = (timeStr) => {
    // Validate and parse the value part of the string as a floating-point number
    const value = parseFloat(timeStr);
    if (isNaN(value)) {
        throw new Error('Invalid time value'); // Handling invalid numeric value
    }

    // Extract the unit (e.g., 'h', 'min', 'minutes', 'days', etc.)
    const unit = timeStr.replace(/[\d.]+/g, '').toLowerCase();

    switch (unit) {
        case 'm':
        case 'min':
        case 'minutes':
            return value * 60 * 1000; // 1 minute = 60 seconds * 1000 ms
        case 'h':
        case 'hr':
        case 'hours':
            return value * 60 * 60 * 1000; // 1 hour = 60 minutes * 60 seconds * 1000 ms
        case 'd':
        case 'day':
        case 'days':
            return value * 24 * 60 * 60 * 1000; // 1 day = 24 hours * 60 minutes * 60 seconds * 1000 ms
        default:
            throw new Error('Invalid time unit'); // Handling invalid time unit
    }
};

const isProduction = envVariables.environment === 'PROD';

//! @desc Register a new user
//! @route POST /api/v1/users/register
//! @access Public
const registerUser = asyncHandler(async (req, res, next) => {
    // console.log("req.body: ", req.body);
    // console.log("req.files: ", req.files);
    const { userName, email, fullName, password, role } = req.body;

    // Check for individual fields and throw specific error messages
    if (isEmpty(userName)) {
        throw new ApiError(400, 'Username is required');
    }
    const isValidUserName = /^[a-zA-Z0-9]+$/.test(userName);
    if (!isValidUserName) {
        throw new ApiError(
            400,
            'Username can only contain letters and numbers',
        );
    }
    if (isEmpty(email)) {
        throw new ApiError(400, 'Email is required');
    } else if (!isValidEmail(email)) {
        throw new ApiError(400, 'Invalid email format');
    }

    if (isEmpty(fullName)) {
        throw new ApiError(400, 'Full name is required');
    }

    if (isEmpty(password)) {
        throw new ApiError(400, 'Password is required');
    }

    // Check if user already exists based on username or email
    const existingUser = await User.findOne({
        $or: [{ userName }, { email }],
    });

    if (existingUser) {
        console.log(userName);
        console.log(email);
        console.log(existingUser);
        let errorMessage = '';
        // Check for which field already exists
        if (
            existingUser.userName === userName.toLowerCase() &&
            existingUser.email === email.toLowerCase()
        ) {
            errorMessage = `Both username "${userName.toLowerCase()}" and email "${email.toLowerCase()}" are already in use.`;
        } else if (existingUser.userName === userName.toLowerCase()) {
            errorMessage = `User with username "${userName.toLowerCase()}" already exists.`;
        } else if (existingUser.email === email.toLowerCase()) {
            errorMessage = `User with email "${email.toLowerCase()}" already exists.`;
        }

        // Log the error message and throw an ApiError
        console.log('🚀 ~ registerUser ~ errorMessage:', errorMessage);
        throw new ApiError(409, errorMessage);
        // const errorMessage = existingUser.userName === userName ? `User with username userName}" already exists` : `User with email "${email}" already exists`;
        // return res.status(409).json(new ApiError(409, errorMessage));
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, 'Avatar is required');
    }

    // Validate avatar mime type
    const avatarFileMimeType = req.files?.avatar?.[0]?.mimetype;
    if (!avatarFileMimeType.startsWith(constant.mimeType.image)) {
        throw new ApiError(400, 'Only image files are allowed for avatar');
    }
    if (avatarFileMimeType !== constant.mimeType.webp) {
        throw new ApiError(400, 'Only webp images are allowed for avatar');
    }

    // Validate avatar size
    const avatarFileSizeInMB = req.files?.avatar?.[0]?.size / (1024 * 1024);
    if (avatarFileSizeInMB > constant.avatarImageSize) {
        throw new ApiError(
            400,
            `Avatar image size should be less than ${constant.avatarImageSize} MB`,
        );
    }

    // Upload the avatar image
    const avatar = await uploadImage(avatarLocalPath);
    if (!avatar) {
        throw new ApiError(400, 'Avatar upload failed');
    }

    // Check for an optional cover image path
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
    let coverImage = '';

    if (coverImageLocalPath) {
        // Validate cover image mime type
        const coverImageFileMimeType = req.files?.coverImage?.[0]?.mimetype;
        if (!coverImageFileMimeType.startsWith(constant.mimeType.image)) {
            throw new ApiError(400, 'Only image files are allowed for cover');
        }
        if (coverImageFileMimeType !== constant.mimeType.webp) {
            throw new ApiError(400, 'Only webp images are allowed for cover');
        }

        // Validate cover image size
        const coverImageFileSizeInMB =
            req.files?.coverImage?.[0]?.size / (1024 * 1024);
        if (coverImageFileSizeInMB > constant.coverImageSize) {
            throw new ApiError(
                400,
                `Cover image size should be less than ${constant.coverImageSize} MB`,
            );
        }

        // Upload the cover image
        coverImage = await uploadImage(coverImageLocalPath);
        if (!coverImage) {
            throw new ApiError(400, 'Cover image upload failed');
        }
    }

    // Handle role assignment based on authentication status
    let userRole = 'user'; // Default role

    if (req.user && req.user.role === 'admin') {
        // Admin is logged in - can set custom role
        if (role) {
            // Check if role is valid
            if (['user', 'admin', 'moderator'].includes(role)) {
                userRole = role;
            } else {
                throw new ApiError(
                    400,
                    'Invalid role. Must be user, admin, or moderator',
                );
            }
        }
        // If no role specified in body, userRole remains 'user' (default)
    }
    // If no token (public signup) or non-admin, userRole remains 'user'

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage ? coverImage.url : '',
        email,
        password,
        userName: userName.toLowerCase(),
        role: userRole,
    });

    const newUser = await User.findById(user._id).select(
        '-password -refreshToken',
    );
    if (!newUser) {
        throw new ApiError(500, 'Something went wrong while creating user');
    }
    // console.log("user: ", user);
    // console.log("newUser: ", newUser);
    return res
        .status(201)
        .json(new ApiResponse(201, newUser, 'User created successfully'));

    // If no errors, proceed with user registration
    // res.status(200).json({ message: 'OK' });
});

//! @desc Login user
//! @route POST /api/v1/users/login
//! @access Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, userName, password } = req.body;

    if (isEmpty(email) && isEmpty(userName)) {
        throw new ApiError(400, 'email or username is required');
    }

    if (email && !isValidEmail(email)) {
        throw new ApiError(400, 'Invalid email format');
    }

    if (isEmpty(password)) {
        throw new ApiError(400, 'Password is required');
    }

    const query = email ? { email } : { userName };

    const user = await User.findOne(query);
    if (!user) {
        throw new ApiError(404, 'user not found, Invalid username or email');
    }
    // const isMatch = await bcrypt.compare(password, user.password);
    const isMatch = await user.isPasswordCorrect(password);
    if (!isMatch) {
        throw new ApiError(401, 'Invalid credentials');
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user._id,
    );
    /**
     *! use withCredentials: true in case of axios
     *! use credentials: 'include' in case of fetch
     *! to allow backend to set cookies in frontend
     */
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        sameSite: 'none',
        maxAge: getMsFromEnv(envVariables.accessTokenExpiry),
        secure: true,
    });

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        sameSite: 'none',
        maxAge: getMsFromEnv(envVariables.refreshTokenExpiry),
        secure: true,
    });

    const loggedInUser = await User.findById(user._id).select(
        '-password -refreshToken',
    );
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { userData: loggedInUser, accessToken, refreshToken },
                'User login successfully',
            ),
        );
});

//! @desc logout a loggedin user
//! @route GET /api/v1/users/logout
//! @access Private
const logout = asyncHandler(async (req, res) => {
    try {
        // Clear the refresh token from database
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: { refreshToken: '' } },
            { new: true },
        );

        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        const cookieOptions = {
            httpOnly: true,
            secure: true,
            maxAge: 0,
        };

        return res
            .status(200)
            .clearCookie('accessToken', cookieOptions)
            .clearCookie('refreshToken', cookieOptions)
            .json(new ApiResponse(200, {}, 'User logout successfully'));
    } catch (error) {
        // Even if database operation fails, still clear cookies
        const cookieOptions = {
            httpOnly: true,
            secure: true,
            maxAge: 0,
        };

        return res
            .status(200)
            .clearCookie('accessToken', cookieOptions)
            .clearCookie('refreshToken', cookieOptions)
            .json(new ApiResponse(200, {}, 'User logout successfully'));
    }
});

//! @desc give user updated access and refresh token
//! @route POST /api/v1/users/refreshToken
//! @access Private
const renewToken = asyncHandler(async (req, res) => {
    const userRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    console.log("🚀 ~ userRefreshToken: ", userRefreshToken);

    if (!userRefreshToken) {
        throw new ApiError(401, 'Unauthorized request: No token provided');
    }
    try {
        const decodedToken = jwt.verify(
            userRefreshToken,
            envVariables.refreshTokenSecret,
        );
        const user = await User.findById(decodedToken._id);
        if (!user) {
            throw new ApiError(401, 'Unauthorized request: Invalid token');
        }

        if (userRefreshToken !== user.refreshToken) {
            throw new ApiError(
                401,
                'Unauthorized request: Refresh token is expired or used',
            );
        }

        const { accessToken, refreshToken } =
            await generateAccessAndRefreshToken(user._id);

        /**
         *! use withCredentials: true in case of axios
         *! use credentials: 'include' in case of fetch
         *! to allow backend to set cookies in frontend
         */
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            sameSite: 'none',
            maxAge: getMsFromEnv(envVariables.accessTokenExpiry),
            secure: true,
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            sameSite: 'none',
            maxAge: getMsFromEnv(envVariables.refreshTokenExpiry),
            secure: true,
        });
        // Remove sensitive fields from user object instead of making another DB call
        const loggedInUser = user.toObject();
        delete loggedInUser.password;
        delete loggedInUser.refreshToken;
        
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { userData: loggedInUser, accessToken, refreshToken },
                    'Tokens updated successfully',
                ),
            );
    } catch (error) {
        throw new ApiError(
            401,
            error?.message || 'Unauthorized request: invalid Token',
        );
    }
});

//! @desc update user password
//! @route POST /api/v1/users/updatePassword
//! @access Private
const updatePassword = asyncHandler(async (req, res) => {
    const { password, newPassword } = req.body;

    if (isEmpty(password)) {
        throw new ApiError(400, 'Password is required');
    }

    if (isEmpty(newPassword)) {
        throw new ApiError(400, 'New password is required');
    }

    if (password === newPassword) {
        throw new ApiError(
            400,
            'new password should be different from current password',
        );
    }
    const user = await User.findById(req.user._id);

    // here will will chech if password provided and hashed password stored in db are same. this is function defined in modal file
    //  it will use bcrypt and hash the current password and compare with hash of password stored in db
    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
        throw new ApiError(400, 'Current password is incorrect');
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, null, 'Password updated successfully'));
});

//! @desc get current user data
//! @route GET /api/v1/users/me
//! @access Private
const currentUser = asyncHandler(async (req, res) => {
    const userData = await User.findById(req.user._id).select(
        '-password -refreshToken',
    );
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { userData },
                'User data received successfully',
            ),
        );
});

//! @desc allow user to reset password
//! @route GET /api/v1/users/forgotPassword
//! @access Public
const forgotPassword = asyncHandler(async (req, res) => {});

//! @desc Update user data or admin update any user
//! @route PATCH /api/v1/users/updateUser/:id?
//! @access Private
const updateUser = asyncHandler(async (req, res) => {
    const { email, fullName, role, isDisabled } = req.body;
    const { id } = req.params;
    let targetUserId = req.user._id; // Default to current user

    // If ID is provided, only admin or moderator can update another user
    if (id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ApiError(400, 'Invalid user id');
        }
        if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
            throw new ApiError(
                403,
                'Only admin or moderator can update other users',
            );
        }
        // Prevent user from updating their own role or disabling themselves
        if (
            id === req.user._id.toString() &&
            (role || typeof isDisabled !== 'undefined')
        ) {
            throw new ApiError(
                403,
                'You cannot update your own role or disable your own account',
            );
        }
        targetUserId = id;
    } else {
        // When updating self, block changes to role or isDisabled
        if (role || typeof isDisabled !== 'undefined') {
            throw new ApiError(
                403,
                'You cannot update your own role or disable your own account',
            );
        }
    }

    const user = await User.findById(targetUserId).select(
        '-password -refreshToken',
    );
    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    // Track if any changes were made
    let hasChanges = false;

    if (email && user.email !== email.toLowerCase()) {
        hasChanges = true;
    }

    if (fullName && user.fullName !== fullName) {
        hasChanges = true;
    }

    if (role && user.role !== role) {
        hasChanges = true;
    }

    if (typeof isDisabled === 'boolean' && user.isDisabled !== isDisabled) {
        hasChanges = true;
    }

    if (!hasChanges) {
        throw new ApiError(400, 'Please update at least one field');
    }

    // Update email
    if (email && user.email !== email.toLowerCase()) {
        if (!isValidEmail(email)) {
            throw new ApiError(400, 'Invalid email format');
        }

        const existingUserWithEmail = await User.findOne({
            email: email.toLowerCase(),
            _id: { $ne: targetUserId },
        });
        if (existingUserWithEmail) {
            throw new ApiError(409, 'Email already in use by another user');
        }

        user.email = email.toLowerCase();
    }

    // Update fullName
    if (fullName && user.fullName !== fullName) {
        user.fullName = fullName;
    }

    // Admin or Moderator updating another user
    if (req.user._id.toString() !== targetUserId.toString()) {
        if (req.user.role === 'admin') {
            if (role) {
                if (!['user', 'admin', 'moderator'].includes(role)) {
                    throw new ApiError(400, 'Invalid role');
                }
                user.role = role;
            }
            if (typeof isDisabled === 'boolean') {
                user.isDisabled = isDisabled;
            }
        } else if (req.user.role === 'moderator') {
            if (typeof isDisabled === 'boolean') {
                user.isDisabled = isDisabled;
            }
            if (role) {
                throw new ApiError(403, 'Only admin can update role');
            }
        }
    }

    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { userData: user },
                'User updated successfully',
            ),
        );
});

//! @desc update user avatar
//! @route POST /api/v1/users/updateAvatar
//! @access Private
const updateUserAvatar = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select(
            '-password -refreshToken',
        );

        const localFilePath = req.file?.path;
        if (!localFilePath) {
            throw new ApiError(400, 'Avatar is required');
        }

        const fileMimeType = req.file?.mimetype;
        if (!fileMimeType.startsWith(constant.mimeType.image)) {
            removeLocalFile(localFilePath);
            throw new ApiError(400, 'Only image files are allowed for avatar');
        }
        if (fileMimeType !== constant.mimeType.webp) {
            removeLocalFile(localFilePath);
            throw new ApiError(400, 'Only webp images are allowed for avatar');
        }

        const fileSizeInMB = req.file?.size / (1024 * 1024);
        if (fileSizeInMB > constant.avatarImageSize) {
            removeLocalFile(localFilePath);
            throw new ApiError(
                400,
                `Image size should be less than ${constant.avatarImageSize} MB`,
            );
        }

        const uploadedImage = await uploadImage(localFilePath);
        if (!uploadedImage?.url) {
            removeLocalFile(localFilePath);
            throw new ApiError(500, 'Error while uploading Avatar');
        }
        if (user.coverImage) {
            await deleteImage(user.avatar);
        }
        user.avatar = uploadedImage.url || '';
        await user.save({ validateBeforeSave: false });
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { userData: user },
                    'User Avatar updated successfully',
                ),
            );
    } catch (error) {
        throw new ApiError(
            500,
            error?.message || 'error while uploading Avatar',
        );
    }
});

//! @desc update user cover image
//! @route POST /api/v1/users/updateCoverImage
//! @access Private
const updateUserCoverImage = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select(
            '-password -refreshToken',
        );

        const localFilePath = req.file?.path;
        if (!localFilePath) {
            throw new ApiError(400, 'Cover image is required');
        }

        const fileMimeType = req.file?.mimetype;
        if (!fileMimeType.startsWith(constant.mimeType.image)) {
            removeLocalFile(localFilePath);
            throw new ApiError(400, 'Only image files are allowed for cover');
        }
        if (fileMimeType !== constant.mimeType.webp) {
            removeLocalFile(localFilePath);
            throw new ApiError(400, 'Only webp images are allowed for cover');
        }

        const fileSizeInMB = req.file?.size / (1024 * 1024);
        if (fileSizeInMB > constant.coverImageSize) {
            removeLocalFile(localFilePath);
            throw new ApiError(
                400,
                `Image size should be less than ${constant.coverImageSize} MB`,
            );
        }

        const uploadedImage = await uploadImage(localFilePath);
        if (!uploadedImage?.url) {
            removeLocalFile(localFilePath);
            throw new ApiError(500, 'Error while uploading cover image');
        }
        if (user.coverImage) {
            await deleteImage(user.coverImage);
        }
        user.coverImage = uploadedImage.url || '';
        await user.save({ validateBeforeSave: false });
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { userData: user },
                    'User cover image updated successfully',
                ),
            );
    } catch (error) {
        console.log('🚀 ~ updateUserCoverImage ~ error:', error);
        throw new ApiError(
            500,
            error?.message || 'error while uploading cover image',
        );
    }
});

//! @desc delete current user or admin delete any user
//! @route DELETE /api/v1/users/deleteUser/:id?
//! @access Private
const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    let targetUserId = req.user._id; // Default to current user

    // If ID is provided, only admin can delete another user
    if (id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ApiError(400, 'Invalid user id');
        }
        if (req.user.role !== 'admin') {
            throw new ApiError(403, 'Only admin can delete other users');
        }
        targetUserId = id;
    }

    // User deleting their own account or admin deleting any user
    const user = await User.findById(targetUserId);
    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    // Delete user's images
    await deleteImage(user.avatar);
    await deleteImage(user.coverImage);

    // Delete the user
    await User.findByIdAndDelete(targetUserId);

    // Clear cookies if user is deleting themselves
    if (targetUserId.toString() === req.user._id.toString()) {
        const cookieOptions = {
            httpOnly: true,
            secure: true,
            maxAge: 0,
        };

        return res
            .status(200)
            .clearCookie('accessToken', cookieOptions)
            .clearCookie('refreshToken', cookieOptions)
            .json(new ApiResponse(200, {}, 'User deleted successfully'));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, 'User deleted successfully'));
});

//! @desc get user/channel profile data
//! @route GET /api/v1/users/channel/{username}
//! @access Private
const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;

    if (!username?.trim()) {
        throw new ApiError(401, 'Username is required');
    }

    const channel = await User.aggregate([
        {
            $match: {
                userName: username.toLowerCase(),
            },
        },
        {
            $lookup: {
                from: 'subscription',
                localField: '_id',
                foreignField: 'channel',
                as: 'subscribers',
            },
        },
        {
            $lookup: {
                from: 'subscription',
                localField: '_id',
                foreignField: 'subscriber',
                as: 'subscribedTo',
            },
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: '$subscribers',
                },
                channelsCount: {
                    $size: '$subscribedTo',
                },
                isSubscribed: {
                    // we can use this shorthand property of condition in mongodb
                    // $cond: [{$in: [req.user?._id, "$subscribers.subscriber"]}, true, false]
                    $cond: {
                        //in can see in array and in object as well
                        // if: {
                        //     $in: [
                        //         req.user?._id,
                        //         { $map: { input: "$subscribers", as: "s", in: "$$s.subscriber" } },
                        //     ],
                        // },
                        if: { $in: [req.user?._id, '$subscribers.subscriber'] },
                        then: true,
                        else: false,
                    },
                },
            },
        },
        {
            $project: {
                fullName: 1,
                userName: 1,
                subscribersCount: 1,
                channelsCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                createdAt: 1,
                email: 1,
            },
        },
    ]);
    console.log('🚀 ~ getUserChannelProfile ~ channel:', channel);

    if (!channel?.length) {
        throw new ApiError(404, 'Channel does not exists');
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                channel[0],
                'User channel fetched successfully',
            ),
        );
});

//! @desc get user watch history
//! @route GET /api/v1/users/watchHistory
//! @access Private
const getUserWatchHistory = asyncHandler(async (req, res) => {
    /*
        this will return us string and mongoose will automatically add ObjectId("{here comes that string}") this when we use find, findById
        req.user._id
        match in aggrigate will not automatically add ObjectId and parentheses we have to manually add that to match document with ID.
    */
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id),
            },
        },
        {
            $lookup: {
                from: 'video',
                localField: 'watchHistory',
                foreignField: '_id',
                as: 'watchHistory',
                pipeline: [
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'owner',
                            foreignField: '_id',
                            as: 'publishedBy',
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        userName: 1,
                                        avatar: 1,
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $addFields: {
                            publishedBy: {
                                $arrayElemAt: ['$publishedBy', 0],
                            },
                        },
                    },
                ],
            },
        },
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user[0]?.watchHistory,
                'Watch History fetched successfully',
            ),
        );
});

//! @desc get all users with pagination
//! @route GET /api/v1/users/allUsers
//! @access Private (authenticated users)
const getAllUsers = asyncHandler(async (req, res) => {
    // Extract search and filter parameters
    const {
        role,
        isDisabled,
        email,
        userName,
        fullName,
        page = 1,
        limit = 10,
    } = req.query;
    const filter = {};

    // Always exclude the current logged-in user
    filter._id = { $ne: req.user._id };

    // Apply search filters if provided
    if (role) filter.role = role;
    if (typeof isDisabled !== 'undefined')
        filter.isDisabled = isDisabled === 'true' || isDisabled === true;
    if (email) filter.email = { $regex: email, $options: 'i' };
    if (userName) filter.userName = { $regex: userName, $options: 'i' };
    if (fullName) filter.fullName = { $regex: fullName, $options: 'i' };

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const totalResults = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalResults / parseInt(limit));

    const users = await User.find(filter)
        .select('-password -refreshToken')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    // Sanitize users (double-check sensitive fields are removed)
    const sanitizedUsers = users.map((user) => {
        const userObj = user.toObject ? user.toObject() : user;
        delete userObj.password;
        delete userObj.refreshToken;
        return userObj;
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                users: sanitizedUsers,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages,
                    totalResults,
                    hasNextPage: parseInt(page) < totalPages,
                    hasPrevPage: parseInt(page) > 1,
                },
            },
            'Users fetched successfully',
        ),
    );
});

/**
 * Get users for moderation (admin/moderator only)
 * @route GET /api/v1/user/moderate
 * @access Private (admin/moderator only)
 */
const getUserModeration = asyncHandler(async (req, res) => {
    const {
        username,
        email,
        fullName,
        role,
        isDisabled,
        page = 1,
        limit = 10,
    } = req.query;
    const currentUserId = req.user._id;
    const userRole = req.user.role;

    // Check permissions
    if (userRole !== 'admin' && userRole !== 'moderator') {
        throw new ApiError(
            403,
            'Only admin and moderator can access user moderation',
        );
    }

    // Build filter object
    const filter = {};

    // Exclude self from results
    filter._id = { $ne: currentUserId };

    // Exclude admin users if current user is moderator
    if (userRole === 'moderator') {
        filter.role = { $ne: 'admin' };
    }

    // Apply search filters
    if (username) {
        filter.userName = { $regex: username, $options: 'i' };
    }
    if (email) {
        filter.email = { $regex: email, $options: 'i' };
    }
    if (fullName) {
        filter.fullName = { $regex: fullName, $options: 'i' };
    }
    if (role && Object.values(userRoles).includes(role)) {
        filter.role = role;
    }
    if (typeof isDisabled === 'boolean') {
        filter.isDisabled = isDisabled;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / parseInt(limit));

    // Get users with pagination
    const users = await User.find(filter)
        .select('-password -refreshToken')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                users,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages,
                    totalUsers,
                    hasNextPage: parseInt(page) < totalPages,
                    hasPrevPage: parseInt(page) > 1,
                },
            },
            'Users fetched for moderation successfully',
        ),
    );
});

//! @desc get user by id
//! @route GET /api/v1/users/:id
//! @access Private
const getUserById = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    // Validate MongoDB ObjectId
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, 'Invalid user id');
    }
    const user = await User.findById(id).select('-password -refreshToken');
    if (!user) {
        throw new ApiError(404, 'User not found');
    }
    return res
        .status(200)
        .json(new ApiResponse(200, user, 'User fetched successfully'));
});

export {
    registerUser,
    loginUser,
    logout,
    renewToken,
    updatePassword,
    currentUser,
    updateUser,
    updateUserAvatar,
    updateUserCoverImage,
    deleteUser,
    getUserChannelProfile,
    getUserWatchHistory,
    getAllUsers,
    getUserById,
    getUserModeration,
};
