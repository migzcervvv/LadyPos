import mongoose from "mongoose";
import { Schema as _Schema, model } from "mongoose";
const Schema = _Schema;

const expenseSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

  amount: { type: Number, required: true },
  category: {
    type: String,
    enum: ["inventory", "rent", "utilities", "salary", "misc"],
    default: "misc",
  },
  note: String,
  date: { type: Date, default: Date.now },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
});

export default model("Expense", expenseSchema);
