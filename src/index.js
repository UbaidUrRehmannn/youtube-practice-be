// import mongoose from 'mongoose';
// import express from 'express';
import connectDB from './db/db.js';
import dotenv from 'dotenv';
import app from './app.js';

dotenv.config({
    path: './env',
});

const port = process.env.PORT || 8080;

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
        console.log(process.env.PORT) ;
        await mongoose.connect(`${process.env.MONGODB_URI}/${constant.dbName}`);
        app.on('error', (err) => {
            console.log('Error while listening to DB', err);
            throw err;
        });
        app.listen(process.env.PORT, () => {
            console.log(`App in listening on port ${process.env.PORT}`);
        });
    } catch (err) {
        console.log('Error while connecting to database: ', err);
        throw err;
    }
})();
*/
