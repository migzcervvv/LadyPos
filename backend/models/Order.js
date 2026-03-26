import { Schema as _Schema, model } from 'mongoose';
const Schema = _Schema;

const orderProductSchema = new Schema({
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true } // store product price at time of purchase
});

const orderSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    products: [orderProductSchema],
    total: { type: Number, required: true },
    orderCompleted: { type: Boolean, default: false },
    orderPaid: { type: Boolean, default: false },
    date: { type: Date, default: Date.now },
    paymentMethod: { type: String, default: 'Cash' },
    notes: { type: String }
}, { timestamps: true });

export default model('Order', orderSchema);