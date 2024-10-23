import { Router } from 'express';
import { upload } from '../middleware/multer.middleware.js';
import { loginUser, logout, registerUser, renewToken, updatePassword, currentUser, updateUser, updateUserAvatar, updateUserCoverImage, deleteUser } from '../controllers/user.controller.js';

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
router.route('/refreshToken').post(updateUser);
router.route('/updateAvatar').post(upload.single('avatar'), updateUserAvatar);
router.route('/updateCover').post(upload.single('coverImage'), updateUserCoverImage);

export default router;
