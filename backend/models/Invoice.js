import mongoose from "mongoose";
import { Schema as _Schema, model } from "mongoose";
const Schema = _Schema;

const invoiceItemSchema = new Schema({
  productName: String,
  quantity: Number,
  price: Number,
  total: Number,
});

const invoiceSchema = new Schema({
  invoiceNumber: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

  orderId: { type: Schema.Types.ObjectId, ref: "Order" },
  customer: {
    name: String,
    phone: String,
    address: String,
    type: { type: String, enum: ["Walk-in", "Regular", "VIP"] },
  },

  items: [invoiceItemSchema],

  subtotal: Number,
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: Number,

  status: {
    type: String,
    enum: ["pending", "completed", "paid"],
    default: "completed",
  },

  issuedAt: { type: Date, default: Date.now },
  paidAt: Date,

  notes: String,
});

// 🔥 THIS is the important part
invoiceSchema.index({ invoiceNumber: 1, userId: 1 }, { unique: true });

export default mongoose.model("Invoice", invoiceSchema);
