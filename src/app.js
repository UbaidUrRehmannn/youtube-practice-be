import cors from 'cors';
import express from 'express';
import constant from './constant.js';
import cookieParser from 'cookie-parser';
import userRouter from './routes/user.routes.js';
import { errorHandler } from './middleware/errorHandler.middleware.js';
import { verifyJwt } from './middleware/auth.middleware.js';
import mongoose from 'mongoose';
import os from 'os';
import { v2 as cloudinary } from 'cloudinary';

const app = express();

// Cloudinary Config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/** 
 *! We can use origin: * if frontend doesn't have these below two options  
 *! use withCredentials: true in case of axios 
 *! use credentials: 'include' in case of fetch 
 *! to allow backend to set cookies in frontend we have to use these options that's why we have to
 *! mention the url in origin if backend has to set httponly: true cookie in frontend.
 */ 
app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        // origin: '*',
        credentials: true,
    }),
);

app.use(express.json({ limit: constant.dataLimit }));
app.use(
    express.urlencoded({
        extended: true,
        limit: constant.dataLimit,
    }),
);
app.use(express.static('public'));
app.use(cookieParser());
app.use(verifyJwt);

//routes declaration
app.use('/api/v1/user', userRouter);

//! @desc use to check if BE is running or not
//! @route GET /api/v1/health-check
//! @access Public
app.get('/api/v1/health-check', async (req, res) => {
    const healthReport = {
        backend: true,
        mongoDb: false,
        cloudinary: false,
        hostname: os.hostname(),
        platform: os.platform(),
        ip: req.ip || req.connection?.remoteAddress,
        timestamp: new Date().toISOString(),
    };

    // Check DB connection
    try {
        healthReport.mongoDb = mongoose.connection.readyState === 1; // 1 = connected
    } catch (err) {
        console.error('MongoDB check failed:', err.message);
    }

    // Check Cloudinary
    try {
        await cloudinary.api.ping();
        healthReport.cloudinary = true;
    } catch (err) {
        console.error('Cloudinary ping failed:', err.message);
    }

    res.status(200).json({
        data: healthReport,
        status: 200,
        message: 'Health check completed',
    });
});

app.use(errorHandler);

export default app;
