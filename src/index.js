// import mongoose from 'mongoose';
// import express from 'express';
import connectDB from './db/db.js';
import dotenv from 'dotenv';

dotenv.config({
    path: './env'
});

connectDB();

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