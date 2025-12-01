import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGO_URL || "";

if (!MONGODB_URI) {
  throw new Error("Please define the MONGO_URL environment variable");
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

// Add listeners ONCE
mongoose.connection.on("connected", () => {
  console.log("🟢 MongoDB Connected");
});

mongoose.connection.on("error", (err) => {
  console.error("🔴 MongoDB Connection Error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("🟠 MongoDB Disconnected");
});

export async function connectDB() {
  if (cached.conn) {
    console.log("⚪ Using existing DB connection");
    return cached.conn;
  }

  if (!cached.promise) {
    console.log("🟡 Creating new DB connection...");
    cached.promise = mongoose
      .connect(MONGODB_URI)
      .then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
