// models/InvoiceCounter.js
import mongoose from "mongoose";

const invoiceCounterSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  seq: {
    type: Number,
    default: 0,
  },
});

// 🔥 Important: one counter per user per year
invoiceCounterSchema.index({ userId: 1, year: 1 }, { unique: true });

export default mongoose.model("InvoiceCounter", invoiceCounterSchema);
