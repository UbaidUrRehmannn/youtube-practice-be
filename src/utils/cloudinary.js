import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import { envVariables } from '../constant.js';

//! IIFE for image upload
// (async function () {
//     // Configuration
//     cloudinary.config({
//         cloud_name: envVariables.cloudinaryCloudName,
//         api_key: envVariables.cloudinaryApiKey,
//         api_secret: envVariables.cloudinaryApiSecret,
//     });

//     const uploadImage = async (localFilePath) => {
//         try {
//             if (!localFilePath) return null;
//             // upload image to cloudinary server
//             const response = await cloudinary.uploader.upload(localFilePath, {
//                 // public_id: 'shoes',
//                 resource_type: 'auto',
//             });
//             // File has been uploaded successfully
//             console.log(
//                 'File is successfully uploaded on cloudinary server: ',
//                 response.url,
//             );
//             return response;
//         } catch (error) {
//             console.log(error);
//             // remove temprory saved local file as uploaded operation got failed
//             fs.unlinkSync(localFilePath);
//             return null;
//         }
//     };

//     // // Upload an image
//     //  const uploadResult = await cloudinary.uploader
//     //    .upload(
//     //        'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
//     //            public_id: 'shoes',
//     //        }
//     //    )
//     //    .catch((error) => {
//     //        console.log(error);
//     //    });

//     // console.log(uploadResult);

//     // // Optimize delivery by resizing and applying auto-format and auto-quality
//     // const optimizeUrl = cloudinary.url('shoes', {
//     //     fetch_format: 'auto',
//     //     quality: 'auto'
//     // });

//     // console.log(optimizeUrl);

//     // // Transform the image: auto-crop to square aspect_ratio
//     // const autoCropUrl = cloudinary.url('shoes', {
//     //     crop: 'auto',
//     //     gravity: 'auto',
//     //     width: 500,
//     //     height: 500,
//     // });

//     // console.log(autoCropUrl);
// })();

// Configuration
cloudinary.config({
    cloud_name: envVariables.cloudinaryCloudName,
    api_key: envVariables.cloudinaryApiKey,
    api_secret: envVariables.cloudinaryApiSecret,
});

const uploadImage = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        // upload image to cloudinary server
        const response = await cloudinary.uploader.upload(localFilePath, {
            // public_id: 'shoes',
            resource_type: 'auto',
        });
        // File has been uploaded successfully
        // console.log('File: ', response);
        // console.log('File is successfully uploaded on cloudinary server: ', response.url);
        fs.unlinkSync(localFilePath); //to delete file locally
        return response;
    } catch (error) {
        // console.log(error);
        // remove temprory saved local file as uploaded operation got failed
        fs.unlinkSync(localFilePath);
        return null;
    }
};

// Function to delete image from Cloudinary
const deleteImage = async (imageUrl) => {
    try {
        if (!imageUrl || imageUrl === '') return null;
        // Extract public ID from Cloudinary URL
        const publicId = extractPublicId(imageUrl);
        // Delete image from Cloudinary
        await cloudinary.uploader.destroy(publicId);
        return true;
    } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
        return null;
    }
};

// Helper function to extract public ID from Cloudinary URL
const extractPublicId = (url) => {
    const parts = url.split('/');
    const publicIdWithExtension = parts[parts.length - 1];
    return publicIdWithExtension.split('.')[0]; // Extract public ID without file extension
};

const removeLocalFile = (localFilePath) => {
    if (localFilePath && fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
    }
}

export { uploadImage, deleteImage, removeLocalFile };