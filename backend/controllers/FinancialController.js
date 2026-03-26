import Financial from '../models/Financial.js';

// Create
export async function createFinancial(req, res) {
    try {
        const financial = new Financial(req.body);
        await financial.save();
        res.status(201).json(financial);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

// Read all
export async function getFinancials(req, res) {
    try {
        const financials = await Financial.find({ userId: req.query.userId });
        res.json(financials);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Read one
export async function getFinancialById(req, res) {
    try {
        const financial = await Financial.findById(req.params.id);
        if (!financial) return res.status(404).json({ error: 'Record not found' });
        res.json(financial);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Update
export async function updateFinancial(req, res) {
    try {
        const financial = await Financial.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!financial) return res.status(404).json({ error: 'Record not found' });
        res.json(financial);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

// Delete
export async function deleteFinancial(req, res) {
    try {
        const financial = await Financial.findByIdAndDelete(req.params.id);
        if (!financial) return res.status(404).json({ error: 'Record not found' });
        res.json({ message: 'Record deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}