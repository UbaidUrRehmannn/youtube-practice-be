import { Router } from 'express';
import { upload } from '../middleware/multer.middleware.js';
import { loginUser, logout, registerUser } from '../controllers/user.controller.js';

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

export default router;
