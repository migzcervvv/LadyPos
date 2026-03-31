import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  category: {
    type: String,
    enum: ["inventory", "rent", "utilities", "salary", "misc"],
    default: "misc",
  },
  note: String,
  date: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

export default mongoose.model("Expense", expenseSchema);
