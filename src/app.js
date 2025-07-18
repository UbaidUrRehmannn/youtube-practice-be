import cors from 'cors';
import express from 'express';
import constant from './constant.js';
import cookieParser from 'cookie-parser';
import userRouter from './routes/user.routes.js';
import { errorHandler } from './middleware/errorHandler.middleware.js';
import { verifyJwt } from './middleware/auth.middleware.js';
const app = express();

    /** 
     *! We can use origin: * if frontend doesen't have these below two options  
     *! use withCredentials: true in case of axios 
     *! use credentials: 'include' in case of fetch 
     *! to allow backend to set cookies in frontend we have to use these options thats why we have to
     *! mention the url in origin if backend hahve to set httponly: true cookie in frontend.
    */ 
app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        // origin: *,
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
    res.status(200).json({
        data: null,
        status: 200,
        message: "Backend is running"
    });
});

app.use(errorHandler);
export default app;
