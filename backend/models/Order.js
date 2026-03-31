import { Schema as _Schema, model } from "mongoose";
const Schema = _Schema;

const orderProductSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }, // store product price at time of purchase
});

const orderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    personId: { type: Schema.Types.ObjectId, ref: "Person", required: false },
    products: [orderProductSchema],
    total: { type: Number, required: true },
    customerType: {
      type: String,
      enum: ["walkin", "customer", "grab", "foodpanda"],
      default: "walkin",
    },
    paymentStatus: {
      type: String,
      enum: ["paid", "debt"],
      default: "debt",
    },
    orderStatus: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
    reference: { type: String, required: false }, // for external orders
    date: { type: Date, default: Date.now },
    paymentMethod: { type: String, default: "Cash" },
    notes: { type: String },
    // Prevent double-processing ledger entries
    ledgerRecorded: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default model("Order", orderSchema);
