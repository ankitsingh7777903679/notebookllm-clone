import mongoose from "mongoose";

export async function dbConnection() {
  const uri = process.env.MONGO_URL as string;
  try {
    await mongoose.connect(uri, { dbName: 'notebooklm' });
    console.log("MongoDB connected:");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
}