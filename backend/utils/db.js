// import mongoose from "mongoose";

// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI)
//     console.log("MongoDB connected successfully");
//   } catch (error) {
//     console.log("Error occured in db.js");
//   }
// };

// export default connectDB;


import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000, // optional: fail fast
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error.message); // <-- show reason
    throw error; // <-- bubble up so index.js can decide
  }
};

export default connectDB;
