import { Schema as _Schema, model } from 'mongoose';
const Schema = _Schema;

const debtSchema = new Schema({
  type: {
    type: String,
    enum: ["debt", "payment"],
    required: true
  },

  amount: {
    type: Number,
    required: true
  },

  orderId: {
    type: Schema.Types.ObjectId,
    ref: "Order"
  },

  paymentMethod: {
    type: String,
    default: "Cash"
  },

  notes: String,

  date: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const personSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    contactInfo: { type: String },
    debts: [debtSchema],
    notes: { type: String }
}, { timestamps: true });

export default model('Person', personSchema);

// services/personService.js
import Person from '../models/Person.js';

export async function addDebtToPerson({
  personId,
  userId,
  amount,
  orderId,
  notes,
  paymentMethod
}) {
  const person = await Person.findOne({ _id: personId, userId });

  if (!person) throw new Error("Person not found");

  person.debts.push({
    type: "debt",
    amount,
    orderId,
    notes,
    paymentMethod: paymentMethod || "Cash",
  });

  await person.save();
  return person;
}
