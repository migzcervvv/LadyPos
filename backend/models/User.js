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
    confirmed: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default model("User", UserSchema);
