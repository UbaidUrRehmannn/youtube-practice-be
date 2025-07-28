import cors from 'cors';
import express from 'express';
import constant, { envVariables } from './constant.js';
import cookieParser from 'cookie-parser';
import userRouter from './routes/user.routes.js';
import tweetRouter from './routes/tweet.routes.js';
import { errorHandler } from './middleware/errorHandler.middleware.js';
import { verifyJwt } from './middleware/auth.middleware.js';
import requireRoutePermission from './middleware/role.middleware.js';
import mongoose from 'mongoose';
import os from 'os';
import { v2 as cloudinary } from 'cloudinary';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './docs/swagger.config.js';

const app = express();

// Cloudinary Config
cloudinary.config({
    cloud_name: envVariables.cloudinaryCloudName,
    api_key: envVariables.cloudinaryApiKey,
    api_secret: envVariables.cloudinaryApiSecret,
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
        origin: envVariables.frontendUrl,
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

// Public routes (no authentication required) - Define BEFORE middleware
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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

app.get('/api/v1/health-check-be', async (req, res) => {
    res.status(200).json({
        data: null,
        status: 200,
        message: 'Health check completed',
    });
});

// Apply authentication middleware AFTER public routes
app.use(verifyJwt);
app.use(requireRoutePermission);

// Protected routes (authentication required)
app.use('/api/v1/user', userRouter);
app.use('/api/v1/tweet', tweetRouter);

app.use(errorHandler);

export default app;
