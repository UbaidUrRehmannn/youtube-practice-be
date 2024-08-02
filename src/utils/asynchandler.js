//higher order function => take function as parameter and returns a function

import constant from "../constant.js";

/* 
    we will create a function and pass function as parameter in it.
    Further down the process I want to call another functionin it below is long form syntex that is shorten in function implementation below.
!    const tempFunction = (func) => {
     to make it async we just add acync before round brackets
!        () => {
!            like this
!        }
!    }
*/
 
// HOF using promises
const asyncHandler = (func) => {
    return (req, res, next) => {
        Promise.resolve(func(req, res, next)).catch((err) => next(err));
    }
}

// HOF using try catch

// const asyncHandler = (func) => async (req, res, next) => {
//     try {
//         await func(req, res, next);
//     } catch (err) {
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message || constant.messages.error
//         })
//     }
// }

export default asyncHandler;