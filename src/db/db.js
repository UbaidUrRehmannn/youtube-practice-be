import mongoose from "mongoose";
import constant from "../constant.js";

const connectDB = async () => {
    try {
        const DbConnectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${constant.dbName}`);
        // console.log("DbConnectionInstance: ", DbConnectionInstance);
        console.log(`\n MongoDB connected !! DB HOST: ${DbConnectionInstance.connection.host}`);
    } catch (error) {
        console.log('Error connecting to database: ', error);
        // process.exit(1); // 0 exit code for successful exit, 1 for exit with faliour
        throw error;
    }
}

export default connectDB;