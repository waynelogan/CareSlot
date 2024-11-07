
// Do not use '@' symbol in your databse user's password else it will show an error.

import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Database Connected");
    } catch (error) {
        console.error("Database connection error:", error);
        process.exit(1); // Exit with failure
    }
};

export default connectDB;
