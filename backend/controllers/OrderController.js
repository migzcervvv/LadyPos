import Order from '../models/Order.js';

// Create
export async function createOrder(req, res) {
    try {
        const order = new Order(req.body);
        await order.save();
        res.status(201).json(order);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

// Read all
export async function getOrders(req, res) {
    try {
        const orders = await Order.find({ userId: req.query.userId }).populate('products.productId');
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Read one
export async function getOrderById(req, res) {
    try {
        const order = await Order.findById(req.params.id).populate('products.productId');
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Update
export async function updateOrder(req, res) {
    try {
        const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json(order);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

// Delete
export async function deleteOrder(req, res) {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json({ message: 'Order deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}