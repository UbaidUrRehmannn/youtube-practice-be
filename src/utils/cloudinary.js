import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

(async function () {
    // Configuration
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
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
            console.log(
                'File is successfully uploaded on cloudinary server: ',
                response.url,
            );
            return response;
        } catch (error) {
            console.log(error);
            // remove temprory saved local file as uploaded operation is filed
            fs.unlinkSync(localFilePath);
            return null;
        }
    };

    // // Upload an image
    //  const uploadResult = await cloudinary.uploader
    //    .upload(
    //        'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
    //            public_id: 'shoes',
    //        }
    //    )
    //    .catch((error) => {
    //        console.log(error);
    //    });

    // console.log(uploadResult);

    // // Optimize delivery by resizing and applying auto-format and auto-quality
    // const optimizeUrl = cloudinary.url('shoes', {
    //     fetch_format: 'auto',
    //     quality: 'auto'
    // });

    // console.log(optimizeUrl);

    // // Transform the image: auto-crop to square aspect_ratio
    // const autoCropUrl = cloudinary.url('shoes', {
    //     crop: 'auto',
    //     gravity: 'auto',
    //     width: 500,
    //     height: 500,
    // });

    // console.log(autoCropUrl);
})();
