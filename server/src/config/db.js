import dns from "node:dns";
import mongoose from "mongoose";

// Resolve SRV DNS issues on Windows / local ISP DNS
dns.setServers(["8.8.8.8", "8.8.4.4"]);

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set in the environment!");
  }
  await mongoose.connect(uri);
  console.log("Connected to MongoDB successfully! 🍃");
}
