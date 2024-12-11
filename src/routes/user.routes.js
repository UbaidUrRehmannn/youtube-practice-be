import { Router } from 'express';
import { upload } from '../middleware/multer.middleware.js';
import { loginUser, logout, registerUser, renewToken, updatePassword, currentUser, updateUser, updateUserAvatar, updateUserCoverImage, deleteUser, getUserChannelProfile, getUserWatchHistory } from '../controllers/user.controller.js';

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
router.route('/updatePassword').post(updatePassword);
router.route('/getUser').get(currentUser);
router.route('/updateUser').patch(updateUser);
router.route('/updateAvatar').patch(upload.single('avatar'), updateUserAvatar);
router.route('/updateCover').patch(upload.single('coverImage'), updateUserCoverImage);
router.route('/deleteUser').delete(deleteUser);
router.route('/channel/:username').get(getUserChannelProfile);
router.route('/watchHistory').get(getUserWatchHistory);

export default router;
