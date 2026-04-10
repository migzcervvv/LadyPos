import Order from "../models/Order.js";
import Person from "../models/Person.js";
import mongoose from "mongoose";
import { createInvoiceFromOrder } from "./InvoiceController.js";

//
// 🔥 HELPER: Add transaction to person
//
async function addTransaction({
  personId,
  kind,
  context,
  amount,
  orderId,
  paymentMethod,
  notes,
  session,
}) {
  if (!personId) return;

  await Person.findByIdAndUpdate(
    personId,
    {
      $push: {
        debts: {
          kind,
          context,
          amount,
          orderId,
          paymentMethod,
          notes,
          date: new Date(),
        },
      },
    },
    { session },
  );
}

//
// CREATE ORDER
//
export async function createOrder(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      products,
      personId,
      paymentStatus,
      customerType,
      reference,
      paymentMethod,
      notes,
    } = req.body;

    const userId = req.user.id;

    // ✅ validate
    if (!products || !products.length) {
      throw new Error("Products are required");
    }

    const total = products.reduce((sum, p) => {
      return sum + (Number(p.price) || 0) * (Number(p.quantity) || 0);
    }, 0);

    if (total <= 0) throw new Error("Invalid total");

    // ✅ create order
    const order = new Order({
      userId,
      personId:
        personId && mongoose.Types.ObjectId.isValid(personId) ? personId : null,
      products,
      total,
      paymentStatus,
      customerType,
      reference,
      paymentMethod,
      notes,
      orderStatus: "pending",
      ledgerRecorded: false,
    });

    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json(order);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    console.error("Create Order Error:", err);
    res.status(500).json({ error: err.message });
  }
}

//
// GET ORDERS
//
export async function getOrders(req, res) {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .populate("products.productId")
      .populate("personId", "name")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

//
// GET SINGLE ORDER
//
export async function getOrderById(req, res) {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.id,
    })
      .populate("products.productId")
      .populate("personId", "name");

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

//
// UPDATE ORDER
//
export async function updateOrder(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.id,
    }).session(session);

    if (!order) {
      throw new Error("Order not found");
    }

    const wasCompleted = order.orderStatus === "completed";

    const { paymentStatus, orderStatus, personId, notes } = req.body;

    // ❌ prevent reverting
    if (wasCompleted && orderStatus === "pending") {
      throw new Error("Cannot revert completed order");
    }

    // ✅ update fields
    if (personId !== undefined) {
      order.personId =
        personId && mongoose.Types.ObjectId.isValid(personId) ? personId : null;
    }

    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (orderStatus) order.orderStatus = orderStatus.toLowerCase();
    if (notes) order.notes = notes;
    //
    // 🔥 HANDLE COMPLETION (ONLY ONCE)
    //
    if (!wasCompleted && order.orderStatus === "completed") {
      if (!["paid", "debt"].includes(order.paymentStatus)) {
        throw new Error("Invalid payment status");
      }

      // 🔥 LEDGER ENTRY
      if (order.personId && !order.ledgerRecorded) {
        if (order.paymentStatus === "debt") {
          await addTransaction({
            personId: order.personId,
            kind: "charge",
            context: "order",
            amount: order.total,
            orderId: order._id,
            paymentMethod: order.paymentMethod,
            notes: "Order charged to debt",
            session,
          });
        }

        if (order.paymentStatus === "paid") {
          await addTransaction({
            personId: order.personId,
            kind: "payment",
            context: "order", // 🔥 DOES NOT affect debt
            amount: order.total,
            orderId: order._id,
            paymentMethod: order.paymentMethod,
            notes: "Order paid",
            session,
          });
        }

        order.ledgerRecorded = true;
      }

      // 🔥 CREATE INVOICE (SAFE)
      try {
        await createInvoiceFromOrder(order._id, req.user.id);
      } catch (err) {
        console.error("Invoice failed:", err.message);
      }
    }

    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json(order);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    console.error("Update Order Error:", err);
    res.status(500).json({ error: err.message });
  }
}

//
// MARK AS COMPLETED (Shortcut)
//
export async function markAsCompleted(req, res) {
  try {
    req.body.orderStatus = "completed";
    return updateOrder(req, res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

//
// MARK AS PAID (SAFE)
//
export async function markAsPaid(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.id,
    }).session(session);

    if (!order) throw new Error("Order not found");

    // Only convert debt → paid
    if (order.paymentStatus === "debt" && order.personId) {
      await addTransaction({
        personId: order.personId,
        kind: "payment",
        context: "debt", // 🔥 reduces debt
        amount: order.total,
        orderId: order._id,
        paymentMethod: order.paymentMethod,
        notes: "Debt settled from order",
        session,
      });
    }

    order.paymentStatus = "paid";

    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json(order);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    res.status(500).json({ error: err.message });
  }
}

//
// DELETE ORDER
//
export async function deleteOrder(req, res) {
  try {
    const order = await Order.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({ message: "Order deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
