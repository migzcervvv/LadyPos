import mongoose from "mongoose";

const invoiceCounterSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: { type: String, default: "invoice", required: true },
    year: { type: Number, required: true },
    seq: { type: Number, default: 0 },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

invoiceCounterSchema.virtual("userId").get(function getUserId() {
  return this.owner;
});

invoiceCounterSchema.index({ owner: 1, type: 1, year: 1 });

export default mongoose.model("InvoiceCounter", invoiceCounterSchema);
