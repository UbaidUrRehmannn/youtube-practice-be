import asyncHandler from '../utils/asynchandler.js';

const registerUser = asyncHandler(async (req, res) => {
    console.log('function run')
    res.status(200).json({
        message: 'OK',
    });
});

export  { registerUser };