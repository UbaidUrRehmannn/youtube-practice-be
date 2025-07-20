// import mongoose from 'mongoose';
// import express from 'express';
import connectDB from './db/db.js';
import app from './app.js';
import { envVariables } from './constant.js';

// dotenv.config({
//     path: './env',
// });

const port = envVariables.port || 8000;

connectDB()
    .then(() => {
        app.on('error', (err) => {
            console.log('Error while listening to DB', err);
            throw err;
        });
        app.listen(port, () => {
            console.log(`Server is running at port ${port}`);
        });
    })
    .catch((err) => {
        console.log('mongo DB connection failed: ', err);
        throw err;
    });

/*
//! This is one way to connect database and start express application

const app = express();
//! Immediately executeable function creation. Sometime we start this function like ;(() => {})() because if it is missed in previous line it will cause problems.
(async () => {
    try {
        console.log(envVariables.port) ;
        await mongoose.connect(`${envVariables.mongoDbUri}/${constant.dbName}`);
        app.on('error', (err) => {
            console.log('Error while listening to DB', err);
            throw err;
        });
        app.listen(envVariables.port, () => {
            console.log(`App in listening on port ${envVariables.port}`);
        });
    } catch (err) {
        console.log('Error while connecting to database: ', err);
        throw err;
    }
})();
*/
