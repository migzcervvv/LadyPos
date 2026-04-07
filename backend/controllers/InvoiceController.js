import Invoice from "../models/Invoice.js";
import Order from "../models/Order.js";
import mongoose from "mongoose";

// Generate invoice number (per user)
const generateInvoiceNumber = async (userId) => {
  const year = new Date().getFullYear();

  const lastInvoice = await Invoice.findOne({ userId })
    .sort({ createdAt: -1 })
    .select("invoiceNumber");

  let nextNumber = 1;

  if (lastInvoice?.invoiceNumber) {
    const parts = lastInvoice.invoiceNumber.split("-");
    const lastSeq = parseInt(parts[2], 10);
    if (!isNaN(lastSeq)) nextNumber = lastSeq + 1;
  }

  return `INV-${year}-${String(nextNumber).padStart(4, "0")}`;
};

// Create from Order (SAFE VERSION)
export const createInvoiceFromOrder = async (orderId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new Error("Invalid order ID");
  }

  // 🔒 Ensure order belongs to user
  const order = await Order.findOne({
    _id: orderId,
    userId,
  }).populate("products.productId");

  if (!order) {
    throw new Error("Order not found or unauthorized");
  }

  // 🔒 Prevent duplicate per user
  const existing = await Invoice.findOne({
    orderId,
    userId,
  });

  if (existing) return existing;

  const items = order.products.map((p) => ({
    productName: p.productId?.name || "Unknown Product",
    quantity: p.quantity,
    price: p.price,
    total: p.quantity * p.price,
  }));

  const subtotal = items.reduce((sum, i) => sum + i.total, 0);
  const tax = 0;
  const total = subtotal + tax;

  // 🔁 Retry mechanism for race conditions
  let attempts = 0;
  let invoice;

  while (attempts < 3) {
    try {
      const invoiceNumber = await generateInvoiceNumber(userId);

      invoice = new Invoice({
        userId,
        invoiceNumber,
        orderId,
        customer: order.customer,
        items,
        subtotal,
        tax,
        total,
        status: "completed",
      });

      await invoice.save();
      return invoice;
    } catch (err) {
      if (err.code === 11000) {
        // Duplicate key → retry
        attempts++;
        continue;
      }
      throw err;
    }
  }

  throw new Error("Failed to generate unique invoice number");
};

// GET invoices
export const getInvoices = async (req, res) => {
  try {
    const { status, from, to, search } = req.query;

    let filter = {
      userId: req.user.id,
    };

    if (status) {
      filter.status = status;
    }

    if (from || to) {
      filter.issuedAt = {};
      if (from) filter.issuedAt.$gte = new Date(from);
      if (to) filter.issuedAt.$lte = new Date(to);
    }

    // 🔍 Optional search (invoice number / customer name)
    if (search) {
      filter.$or = [
        { invoiceNumber: { $regex: search, $options: "i" } },
        { "customer.name": { $regex: search, $options: "i" } },
      ];
    }

    const invoices = await Invoice.find(filter)
      .sort({ issuedAt: -1 })
      .limit(100);

    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET or CREATE invoice (SAFE)
export const getOrCreateInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log("Ensuring invoice for order:", orderId, "User:", req.user.id);

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ error: "Invalid order ID" });
    }

    // 🔒 Always scope by user
    let invoice = await Invoice.findOne({
      orderId,
      userId: req.user.id,
    });

    if (!invoice) {
      invoice = await createInvoiceFromOrder(orderId, req.user.id);
    }

    res.json(invoice);
  } catch (err) {
    if (err.message.includes("unauthorized")) {
      return res.status(403).json({ error: err.message });
    }

    res.status(500).json({ error: err.message });
  }
};
