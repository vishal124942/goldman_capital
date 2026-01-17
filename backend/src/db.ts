import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;

if (!MONGODB_URI) {
  throw new Error(
    "MONGODB_URI must be set. Did you forget to add it to .env?",
  );
}

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

export const db = mongoose.connection;
export default mongoose;
