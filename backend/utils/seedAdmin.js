import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js"; // adjust path if needed
import dotenv from "dotenv";

dotenv.config();

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

async function seedAdmin() {
  try {
    const existingAdmin = await User.findOne({ identifier: "admin" });
    if (existingAdmin) {
      console.log("Admin user already exists:", existingAdmin.identifier);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("admin123", 10); // change password as needed

    const adminUser = new User({
      identifier: "admin",
      password: hashedPassword,
      role: "admin",
      confirmed: true,
    });

    await adminUser.save();
    console.log("Admin user created successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding admin user:", err);
    process.exit(1);
  }
}

seedAdmin();
