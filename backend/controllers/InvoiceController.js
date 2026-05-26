import mongoose from "mongoose";
import Invoice from "../models/Invoice.js";
import Transaction from "../models/Order.js";
import InvoiceCounter from "../models/InvoiceCounter.js";
import { respond, respondError } from "../utils/responseHelpers.js";

const ownerIdFrom = (req) => req.user?._id || req.user?.id;
const pageFrom = (req) => Math.max(1, Number.parseInt(req.query.page ?? 1, 10));
const limitFrom = (req) =>
  Math.max(1, Number.parseInt(req.query.limit ?? 20, 10));
const statusFromPayment = (paymentStatus) => {
  if (paymentStatus === "paid") return "paid";
  if (paymentStatus === "partial") return "partial";
  return "unpaid";
};

const generateInvoiceNumber = async (owner, session) => {
  const year = new Date().getFullYear();
  const counter = await InvoiceCounter.findOneAndUpdate(
    { owner, type: "invoice", year },
    { $inc: { seq: 1 } },
    { upsert: true, new: true, session },
  );

  return `INV-${year}-${String(counter.seq).padStart(4, "0")}`;
};

export async function createInvoiceForTransaction(transaction, session = null) {
  const existing = await Invoice.findOne({
    owner: transaction.owner,
    transaction: transaction._id,
  }).session(session);

  if (existing) return existing;

  const invoiceNumber = await generateInvoiceNumber(transaction.owner, session);
  const [invoice] = await Invoice.create(
    [
      {
        owner: transaction.owner,
        customer: transaction.customer,
        transaction: transaction._id,
        invoiceNumber,
        dueDate:
          transaction.balance > 0
            ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            : null,
        status: statusFromPayment(transaction.paymentStatus),
      },
    ],
    { session },
  );

  return invoice;
}

export const createInvoiceFromOrder = async (reqOrOrderId, resOrUserId) => {
  if (typeof reqOrOrderId === "object" && reqOrOrderId.params) {
    const req = reqOrOrderId;
    const res = resOrUserId;
    return getOrCreateInvoice(req, res);
  }

  const transaction = await Transaction.findOne({
    _id: reqOrOrderId,
    owner: resOrUserId,
  });
  if (!transaction) throw new Error("Transaction not found or unauthorized");
  return createInvoiceForTransaction(transaction);
};

export const getInvoices = async (req, res) => {
  try {
    const owner = ownerIdFrom(req);
    const page = pageFrom(req);
    const limit = limitFrom(req);
    const filter = { owner };

    if (req.query.status) filter.status = req.query.status;
    if (req.query.customer) filter.customer = req.query.customer;
    if (req.query.from || req.query.to) {
      filter.issuedAt = {};
      if (req.query.from) filter.issuedAt.$gte = new Date(req.query.from);
      if (req.query.to) filter.issuedAt.$lte = new Date(req.query.to);
    }

    const [invoices, total] = await Promise.all([
      Invoice.find(filter)
        .populate("customer", "name phone address")
        .populate({
          path: "transaction",
          populate: { path: "items.product", select: "name sku price" },
        })
        .sort({ issuedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Invoice.countDocuments(filter),
    ]);

    respond(res, 200, "Invoices loaded", invoices, {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    respondError(res, 500, err.message);
  }
};

export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      owner: ownerIdFrom(req),
    })
      .populate("customer", "name phone email address")
      .populate({
        path: "transaction",
        populate: { path: "items.product", select: "name sku price" },
      });

    if (!invoice) return respondError(res, 404, "Invoice not found");
    respond(res, 200, "Invoice loaded", invoice);
  } catch (err) {
    respondError(res, 500, err.message);
  }
};

export const getOrCreateInvoice = async (req, res) => {
  try {
    const owner = ownerIdFrom(req);
    const transactionId = req.params.orderId || req.params.transactionId;

    if (!mongoose.Types.ObjectId.isValid(transactionId)) {
      return respondError(res, 400, "Invalid transaction ID");
    }

    const transaction = await Transaction.findOne({
      _id: transactionId,
      owner,
    });
    if (!transaction) return respondError(res, 404, "Transaction not found");

    const invoice = await createInvoiceForTransaction(transaction);
    respond(res, 200, "Invoice loaded", invoice);
  } catch (err) {
    respondError(res, 500, err.message);
  }
};

export const markVoid = async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, owner: ownerIdFrom(req) },
      { status: "void" },
      { new: true },
    );

    if (!invoice) return respondError(res, 404, "Invoice not found");
    respond(res, 200, "Invoice voided", invoice);
  } catch (err) {
    respondError(res, 500, err.message);
  }
};
