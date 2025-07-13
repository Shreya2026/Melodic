import mongoose from 'mongoose';


export const connectDB = async () => {
    try{
        const conn=await mongoose.connect(process.env.MONGODB_URL);
        console.log(`Connected to MongoDB at ${conn.connection.host}`);
    }catch(error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1); // Exit the process with failure
    }
}