import bcrypt from 'bcrypt';
import { User } from '../models/user.model.js';
import ApiError from '../utils/errorhandler.js';
import asyncHandler from '../utils/asynchandler.js';
import ApiResponse from '../utils/responsehandler.js';
import { uploadImage } from '../utils/cloudinary.js';
import { generateAccessAndRefreshToken } from '../utils/common.js';
import { isValidEmail, isEmpty } from '../utils/validationUtils.js';

const getMsFromEnv = (timeStr) => {
    const hours = parseInt(timeStr);
    return hours * 60 * 60 * 1000; // 1 hour = 60 minutes * 60 seconds * 1000 ms
}

const registerUser = asyncHandler(async (req, res, next) => {
    // console.log("req.body: ", req.body);
    // console.log("req.files: ", req.files);
    const { userName, email, fullName, password } = req.body;

    // Check for individual fields and throw specific error messages
    if (isEmpty(userName)) {
        throw new ApiError(400, 'Username is required');
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

    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        maxAge: getMsFromEnv(process.env.ACCESS_TOKEN_EXPIRY),
        secure: true,
    });
    
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        maxAge: getMsFromEnv(process.env.REFRESH_TOKEN_EXPIRY),
        secure: true,
    });

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
    return res.status(200).json(
        new ApiResponse(200, {userData: loggedInUser,  accessToken,  refreshToken}, "User login successfully")
    )
})

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

const renewRefreshToken = asyncHandler( async (req, res) => {
    return res.status(200).json(
        new ApiResponse(200, {}, 'token renewed successfully')
    )
})

export { registerUser, loginUser, logout, renewRefreshToken };
