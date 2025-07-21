import dotenv from 'dotenv';
dotenv.config();

const constant = {
    dbName: 'youtubePracticeDb',
    dataLimit: '20kb',
    avatarImageSize: 2, // size is in MB
    coverImageSize: 3, // size is in MB
    mimeType: {
        image: 'image/',
        webp: 'image/webp',
    },
    publicRouts: ['/health-check', '/register', '/login'],
    messages: {
        error: 'Something went wrong',
        success: 'Success',
    },
};

export const envVariables = {
    environment: process.env.ENVIRONMENT,
    port: process.env.PORT,
    mongoDbUri: process.env.MONGODB_URI,
    frontendUrl: process.env.FRONTEND_URL,
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
    accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY,
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
    refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY,
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
};

export default constant;
