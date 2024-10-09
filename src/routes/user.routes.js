import { Router } from 'express';
import { registerUser } from '../controllers/user.controller.js';
import { upload } from '../middleware/multer.middleware.js';
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

export default router;
