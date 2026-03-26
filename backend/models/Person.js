import { Schema as _Schema, model } from 'mongoose';
const Schema = _Schema;

const debtSchema = new Schema({
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    notes: { type: String }
});

const personSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    contactInfo: { type: String },
    debts: [debtSchema],
    notes: { type: String }
}, { timestamps: true });

export default model('Person', personSchema);