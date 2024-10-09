import asyncHandler from '../utils/asynchandler.js';

const registerUser = asyncHandler(async (req, res) => {
    console.log("🚀 ~ registerUser ~ req:", req)
    /* 
        when user route on /register this function should run and it should do following steps.
        1 => it should check for all required fields 
    */
    console.log('function run');
    res.status(200).json({
        message: 'OK',
    });
});

export { registerUser };