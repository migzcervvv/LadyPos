import { Schema, model } from "mongoose";

const UserSchema = new Schema(
  {
    identifier: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    name: { type: String },
    phone: { type: String, unique: true, sparse: true },
    address: { type: String },
    confirmed: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default model("User", UserSchema);
