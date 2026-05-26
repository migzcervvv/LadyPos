import mongoose from "mongoose";
import Transaction from "./Order.js";

const { Schema, model } = mongoose;

const debtPaymentSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },
    transaction: {
      type: Schema.Types.ObjectId,
      ref: "Transaction",
      index: true,
    },
    amountPaid: { type: Number, required: true, min: 1 },
    paymentMethod: {
      type: String,
      enum: ["cash", "gcash", "bank", "credit"],
      default: "cash",
    },
    paymentReference: { type: String, default: "", trim: true },
    paidAt: { type: Date, default: Date.now, index: true },
    notes: { type: String, default: "" },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

debtPaymentSchema.virtual("userId").get(function getUserId() {
  return this.owner;
});

debtPaymentSchema.virtual("personId").get(function getPersonId() {
  return this.customer;
});

debtPaymentSchema.pre("save", async function applyPayment(next) {
  if (!this.isNew || !this.transaction) return;

  try {
    const transaction = await Transaction.findOne({
      _id: this.transaction,
      owner: this.owner,
      customer: this.customer,
      voidedAt: { $exists: false },
    }).session(this.$session());

    if (!transaction) {
      throw new Error("Linked transaction not found");
    }

    if (this.amountPaid > transaction.balance) {
      throw new Error("Payment exceeds remaining balance");
    }

    transaction.amountPaid += this.amountPaid;
    transaction.balance = Math.max(
      0,
      transaction.totalAmount - transaction.amountPaid,
    );
    await transaction.save({ session: this.$session() });
    return;
  } catch (err) {
    next(err);
  }
});

debtPaymentSchema.index({ owner: 1, customer: 1, paidAt: -1 });
debtPaymentSchema.index({ owner: 1, transaction: 1, paidAt: -1 });

export default model("DebtPayment", debtPaymentSchema);
