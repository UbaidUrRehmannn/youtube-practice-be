import bcrypt from 'bcrypt';
import { User } from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import ApiError from '../utils/errorhandler.js';
import asyncHandler from '../utils/asynchandler.js';
import { uploadImage, deleteImage } from '../utils/cloudinary.js';
import ApiResponse from '../utils/responsehandler.js';
import { generateAccessAndRefreshToken } from '../utils/common.js';
import { isValidEmail, isEmpty } from '../utils/validationUtils.js';

const getMsFromEnv = (timeStr) => {
    const hours = parseInt(timeStr);
    return hours * 60 * 60 * 1000; // 1 hour = 60 minutes * 60 seconds * 1000 ms
}

const isProduction = process.env.ENVIRONMENT === 'PROD';

//! @desc Register a new user
//! @route POST /api/v1/users/register
//! @access Public
const registerUser = asyncHandler(async (req, res, next) => {
    // console.log("req.body: ", req.body);
    // console.log("req.files: ", req.files);
    const { userName, email, fullName, password } = req.body;

    // Check for individual fields and throw specific error messages
    if (isEmpty(userName)) {
        throw new ApiError(400, 'Username is required');
    }
    const isValidUserName = /^[a-zA-Z0-9]+$/.test(userName);
    if (!isValidUserName) {
        throw new ApiError(400, 'Username can only contain letters and numbers');
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
        const errorMessage = existingUser.userName === userName ? `User with username "${userName}" already exists` : `User with email "${email}" already exists`;
        throw new ApiError(409, errorMessage);
        // const errorMessage = existingUser.userName === userName ? `User with username userName}" already exists` : `User with email "${email}" already exists`;
        // return res.status(409).json(new ApiError(409, errorMessage));
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, 'Avatar is required');
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
        coverImage = await uploadImage(coverImageLocalPath);
        if (!coverImage) {
            throw new ApiError(400, 'Cover image upload failed');
        }
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage ? coverImage.url : '',
        email,
        password,
        userName: userName.toLowerCase()
    });

    const newUser = await User.findById(user._id).select("-password -refreshToken");
    if (!newUser) {
        throw new ApiError(500, 'Something went wrong while creating user');
    }
    // console.log("user: ", user);
    // console.log("newUser: ", newUser);
    return res.status(201).json(
        new ApiResponse(201, newUser, "User created successfully")
    )
    
    // If no errors, proceed with user registration
    // res.status(200).json({ message: 'OK' });
});

//! @desc Login user
//! @route POST /api/v1/users/login
//! @access Public
const loginUser = asyncHandler(async (req, res) => {
   const {email, userName, password} = req.body;

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
        throw new ApiError(401, 'Invalid password');
    }
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);
    /** 
     *! use withCredentials: true in case of axios 
     *! use credentials: 'include' in case of fetch 
     *! to allow backend to set cookies in frontend
    */ 
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        sameSite: 'none',
        maxAge: getMsFromEnv(process.env.ACCESS_TOKEN_EXPIRY),
        secure: true,
    });
    
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        sameSite: 'none',
        maxAge: getMsFromEnv(process.env.REFRESH_TOKEN_EXPIRY),
        secure: true,
    });

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
    return res.status(200).json(
        new ApiResponse(200, {userData: loggedInUser,  accessToken,  refreshToken}, "User login successfully")
    )
})

//! @desc logout a loggedin user
//! @route GET /api/v1/users/logout
//! @access Private
const logout = asyncHandler ( async(req, res) => {
    await User.findByIdAndUpdate(req.user._id, 
        { $set: { refreshToken: '' }},
        { new: true},
    )

    const cookieOptions = {
        httpOnly: true,
        secure: true,
        maxAge: 0
    };
    
    return res.status(200).clearCookie('accessToken', cookieOptions).clearCookie('refreshToken', cookieOptions).json(
        new ApiResponse(200, {}, "User logout successfully")
    )
})

//! @desc give user updated access and refresh token
//! @route POST /api/v1/users/refreshToken
//! @access Private
const renewToken = asyncHandler( async (req, res) => {
    const userRefreshToken =  req.cookies.refreshToken || req.body.refreshToken;

    if (!userRefreshToken) {
        throw new ApiError(401, "Unauthorized request: No token provided");
    }
    try {
        const decodedToken = jwt.verify(userRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedToken._id)
        if (!user) {
            throw new ApiError(401, 'Unauthorized request: Invalid token');
        }
    
        if (userRefreshToken !== user.refreshToken) {
            throw new ApiError(401, 'Unauthorized request: Refresh token is expired or used');
        }
    
        const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);
    
        /** 
         *! use withCredentials: true in case of axios 
         *! use credentials: 'include' in case of fetch 
         *! to allow backend to set cookies in frontend
        */ 
         res.cookie('accessToken', accessToken, {
            httpOnly: true,
            sameSite: 'none',
            maxAge: getMsFromEnv(process.env.ACCESS_TOKEN_EXPIRY),
            secure: true,
        });
        
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            sameSite: 'none',
            maxAge: getMsFromEnv(process.env.REFRESH_TOKEN_EXPIRY),
            secure: true,
        });
        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
        return res.status(200).json(
            new ApiResponse(200, {userData: loggedInUser, accessToken, refreshToken}, 'Tokens updated successfully')
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Unauthorized request: invalid Token");
    }
})

//! @desc update user password 
//! @route POST /api/v1/users/updatePassword
//! @access Private
const updatePassword = asyncHandler( async(req, res) => {
    const {password, newPassword} = req.body;
     
    if(isEmpty(password)) {
        throw new ApiError(400, 'Password is required');
    }
     
    if(isEmpty(newPassword)) {
        throw new ApiError(400, 'New password is required');
    }

    if (password === newPassword) {
        throw new ApiError(400, 'Old password and new password are same');
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

    return res.status(200).json(
        new ApiResponse(200, null, 'Password updated successfully')
    )
})

//! @desc get current user data
//! @route GET /api/v1/users/getUser
//! @access Private
const currentUser = asyncHandler( async(req, res) => {
    const userData = await User.findById(req.user._id).select('-password -refreshToken');
    return res.status(200).json(
        new ApiResponse(200, {userData}, 'User received successfully')
    )
})

//! @desc update user data
//! @route POST /api/v1/users/updateUser
//! @access Private
const updateUser = asyncHandler( async(req, res) => {
    const {email, fullName} = req.body;
    const user = await User.findById(req.user._id)
    if ((fullName && user.fullName === fullName) && (email && user.email === email)) {
        throw new ApiError(400, "Please updat atleast one field");
    }
    if (email && user.email !== email) {
        if (!isValidEmail(email)) throw new ApiError(400, "Invalid email format");
        user.email = email
    }
    if (fullName && user.fullName !== fullName) {
        user.fullName = fullName
    }
    await user.save({validateBeforeSave: false});
    return res.status(200).json(
        new ApiResponse(200, {userData: user}, 'User updated successfully')
    )
})

//! @desc update user avatar
//! @route POST /api/v1/users/updateAvatar
//! @access Private
const updateUserAvatar = asyncHandler( async(req, res) => {
    try {
        const user = await User.findById(req.user._id);

        const localFilePath = req.file?.path;
        if (!localFilePath) {
            throw new ApiError(400, "Avatar is required");
        }
        
        const uploadedImage = await uploadImage(localFilePath);
        if (!uploadedImage?.url) {
            throw new ApiError(500, "Error while uploading Avatar");
        }
        if (user.coverImage) {
            await deleteImage(user.avatar)
        }
        user.avatar = uploadedImage.url || '';
        user.save({ validateBeforeSave: false});
        return res.status(200).json(
            new ApiResponse(200, {userData: user}, 'User Avatar updated successfully')
        )
    } catch (error) {
        throw new ApiError(500, error?.message || "error while uploading Avatar");
    }
})

//! @desc update user cover image
//! @route POST /api/v1/users/updateCoverImage
//! @access Private
const updateUserCoverImage = asyncHandler (async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        const localFilePath = req.file?.path;
        if (!localFilePath) {
            throw new ApiError(400, "Cover image is required");
        }
        
        const uploadedImage = await uploadImage(localFilePath);
        if (!uploadedImage?.url) {
            throw new ApiError(500, "Error while uploading cover image");
        }
        if (user.coverImage) {
            await deleteImage(user.coverImage)
        }
        user.coverImage = uploadedImage.url || '';
        user.save({ validateBeforeSave: false});
        return res.status(200).json(
            new ApiResponse(200, {userData: user}, 'User cover image updated successfully')
        )
    } catch (error) {
        throw new ApiError(500, error?.message || "error while uploading cover image");
    }
})

//! @desc delete current user
//! @route POST /api/v1/users/deleteUser
//! @access Private
const deleteUser = asyncHandler (async (req, res) => {
    const user = await User.findById(req.user._id);

    await deleteImage(user.avatar);
    await deleteImage(user.coverImage);

    await User.findByIdAndDelete(req.user._id);
    const cookieOptions = {
        httpOnly: true,
        secure: true,
        maxAge: 0
    };

    return res.status(200).clearCookie('accessToken', cookieOptions).clearCookie('refreshToken', cookieOptions).json(
        new ApiResponse(200, {}, 'User deleted successfully')
    )
})

export { registerUser, loginUser, logout, renewToken, updatePassword, currentUser, updateUser, updateUserAvatar, updateUserCoverImage, deleteUser };
