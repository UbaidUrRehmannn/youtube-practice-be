import cors from 'cors';
import express from 'express';
import constant from './constant.js';
import cookieParser from 'cookie-parser';
import userRouter from './routes/user.routes.js';

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

//routes declaration
app.use('/api/v1/users', userRouter);

export default app;
