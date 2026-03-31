import Invoice from "../models/Invoice.js";
import Order from "../models/Order.js";

// Generate invoice number
const generateInvoiceNumber = async (count) => {
  const year = new Date().getFullYear();
  return `INV-${year}-${String(count + 1).padStart(4, "0")}`;
};

// Create from Order
export const createInvoiceFromOrder = async (orderId) => {
  // 🔒 prevent duplicates
  const existing = await Invoice.findOne({ orderId });
  if (existing) return existing;

  const order = await Order.findById(orderId).populate("products.productId");

  if (!order) throw new Error("Order not found");

  const items = order.products.map((p) => ({
    productName: p.productId.name,
    quantity: p.quantity,
    price: p.price,
    total: p.quantity * p.price,
  }));

  const subtotal = items.reduce((sum, i) => sum + i.total, 0);
  const tax = 0;
  const total = subtotal + tax;

  const count = await Invoice.countDocuments({
    userId: order.userId,
  });
  const invoiceNumber = await generateInvoiceNumber(count);

  const invoice = new Invoice({
    userId: order.userId,
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
};
export const getInvoices = async (req, res) => {
  try {
    const { status, from, to, search } = req.query;

    let filter = {};

    if (status) {
      filter.status = status;
    }

    if (from || to) {
      filter.issuedAt = {};
      if (from) filter.issuedAt.$gte = new Date(from);
      if (to) filter.issuedAt.$lte = new Date(to);
    }

    const invoices = await Invoice.find({
      userId: req.user.id,
      ...filter,
    })
      .sort({ issuedAt: -1 })
      .limit(100);

    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const getOrCreateInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;

    let invoice = await Invoice.findOne({ orderId });

    if (!invoice) {
      invoice = await createInvoiceFromOrder(orderId);
    }

    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
