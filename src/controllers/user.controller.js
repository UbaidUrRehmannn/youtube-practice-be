// import asyncHandler from '../utils/asynchandler.js';
// import ApiError from '../utils/errorhandler.js'

// const registerUser = asyncHandler(async (req, res) => {
//     console.log("🚀 ~ registerUser ~ req:", req.body)
//     const { userName, email, fullName, password } = req.body
//     /*
//         when user route on /register this function should run and it should do following steps.
//         you can see what fields are required from users modal schema
//         1 => it should check for all required fields coming from frontend
//         2 => check validation
//         3 => upload file
//         4 => check if user already exists: username, email, mobile etc
//         5 => create user in db
//     */
//    if ([userName, email, fullName, password].some(field => field?.trim() === '')) {
//     throw new ApiError(400, "All fields are required")
//    }
//     res.status(200).json({
//         message: 'OK',
//     });
// });

// export { registerUser };

import { User } from '../models/user.model.js';
import ApiError from '../utils/errorhandler.js';
import asyncHandler from '../utils/asynchandler.js';
import ApiResponse from '../utils/responsehandler.js';
import { uploadImage } from '../utils/cloudinary.js';
import { isValidEmail, isEmpty } from '../utils/validationUtils.js';

const registerUser = asyncHandler(async (req, res, next) => {
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
        const errorMessage =
            existingUser.userName === userName
                ? `User with username "${userName}" already exists`
                : `User with email "${email}" already exists`;
        throw new ApiError(409, errorMessage);
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    console.log('🚀 req.files:', avatarLocalPath);
    if (!avatarLocalPath) {
        throw new ApiError(400, 'Avatar is required');
    }
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    console.log('🚀 req.files:', coverImageLocalPath);
    const avatar = await uploadImage(avatarLocalPath);
    if (!avatar) {
        throw new ApiError(400, 'Avatar upload failed');
    }
    const coverImage = coverImageLocalPath !== '' ? await uploadImage(avatarLocalPath) : '';

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage.url || '',
        email,
        password,
        userName: userName.toLowerCase()
    })

    const newUser = await User.findById(user._id).select("-password -refreshToken");
    if (!newUser) {
        throw new ApiError(500, 'Something went wrong while creating user');
    }
    console.log("user: ", user);
    console.log("newUser: ", newUser);
    return res.status(201).json(
        new ApiResponse(200, newUser, "User created successfully")
    )
    
    // If no errors, proceed with user registration
    // res.status(200).json({ message: 'OK' });
});

export { registerUser };
