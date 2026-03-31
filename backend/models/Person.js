import { Schema as _Schema, model } from "mongoose";
const Schema = _Schema;

const debtSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["debt", "payment"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },

    paymentMethod: {
      type: String,
      default: "Cash",
    },

    notes: String,

    date: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true },
);

const personSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    contactInfo: { type: String },
    debts: [debtSchema],
    notes: { type: String },
  },
  { timestamps: true },
);

export default model("Person", personSchema);
