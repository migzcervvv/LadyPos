import { Schema as _Schema, model } from 'mongoose';
const Schema = _Schema;

const expenseSchema = new Schema({
    type: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now }
});

const financialSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    capitalInvested: { type: Number, default: 0 },
    grossIncome: { type: Number, default: 0 },
    netIncome: { type: Number, default: 0 },
    expenses: [expenseSchema],
    notes: { type: String }
}, { timestamps: true });

export default model('Financial', financialSchema);