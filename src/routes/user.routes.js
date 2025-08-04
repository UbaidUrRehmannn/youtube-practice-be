import { Router } from 'express';
import { upload } from '../middleware/multer.middleware.js';
import { loginUser, logout, registerUser, renewToken, updatePassword, currentUser, updateUser, updateUserAvatar, updateUserCoverImage, deleteUser, getUserChannelProfile, getUserWatchHistory, getAllUsers, getUserById, getUserModeration } from '../controllers/user.controller.js';
import paginationMiddleware from '../middleware/pagination.middleware.js';
import { User } from '../models/user.model.js';
import { verifyJwt } from '../middleware/auth.middleware.js';
// import { refreshTokenRateLimit } from '../middleware/rateLimit.middleware.js';

const router = Router();

router.route('/register').post(
    // this is how we add middleware in backend
    upload.fields([
        // here the number of object means the number of files, 2 objects means two files
        {
            // here name field should match the image field mentioned in modal.schema
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
);

router.route('/login').post(loginUser);
router.route('/logout').get(logout);
router.route('/refreshToken').post(renewToken);
// router.route('/refreshToken').post(refreshTokenRateLimit, renewToken);
router.route('/updatePassword').post(updatePassword);
router.route('/me').get(currentUser);
router.route('/updateUser/:id?').patch(updateUser);
router.route('/updateAvatar').patch(upload.single('avatar'), updateUserAvatar);
router.route('/updateCover').patch(upload.single('coverImage'), updateUserCoverImage);
router.route('/deleteUser/:id?').delete(deleteUser);
router.route('/channel/:username').get(getUserChannelProfile);
router.route('/watchHistory').get(getUserWatchHistory);
router.route('/allUsers').get(
    paginationMiddleware(User, {
        select: '-password -refreshToken',
        sort: '-createdAt',
        defaultLimit: 10,
        maxLimit: 100,
        allowedSortFields: ['createdAt', 'updatedAt', 'userName', 'fullName', 'email', 'role']
    }), 
    getAllUsers
);

// User moderation endpoint (admin/moderator only)
router.route('/moderate').get(getUserModeration);

router.route('/:id').get(getUserById);

export default router;
