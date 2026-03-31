import mongoose from "mongoose";

const invoiceItemSchema = new mongoose.Schema({
  productName: String,
  quantity: Number,
  price: Number,
  total: Number,
});

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, unique: true },

  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },

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

export default mongoose.model("Invoice", invoiceSchema);
