import { Schema as _Schema, model } from 'mongoose';
const Schema = _Schema;

const productSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    category: { type: String, default: 'General' },
    sellingPrice: { type: Number, required: true },
    costPrice: { type: Number },
    quantity: { type: Number, default: 0 },
    paidStatus: { type: Boolean, default: false },
}, { timestamps: true });

export default model('Product', productSchema);