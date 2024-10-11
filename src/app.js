import cors from 'cors';
import express from 'express';
import constant from './constant.js';
import cookieParser from 'cookie-parser';
import userRouter from './routes/user.routes.js';
import { errorHandler } from './middleware/errorHandler.middleware.js'
import { verifyJwt } from './middleware/auth.middleware.js';
const app = express();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    }),
);

app.use(express.json({limit: constant.dataLimit}));
app.use(express.urlencoded({
    extended: true,
    limit: constant.dataLimit
}));
app.use(express.static('public'));
app.use(cookieParser());
app.use(verifyJwt);

//routes declaration
app.use('/api/v1/user', userRouter);

app.use(errorHandler); 
export default app;
