import Product from '../models/Product.js';

// Create
export async function createProduct(req, res) {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

// Read all
export async function getProducts(req, res) {
    try {
        const products = await Product.find({ userId: req.query.userId });
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Read one
export async function getProductById(req, res) {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Update
export async function updateProduct(req, res) {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

// Delete
export async function deleteProduct(req, res) {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}