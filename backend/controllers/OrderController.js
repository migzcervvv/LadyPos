import Order from "../models/Order.js";
import { addDebtToPerson, addPaymentToPerson } from "../utils/personService.js";

// Create Order (Authenticated user only)
import mongoose from "mongoose";

export async function createOrder(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { products, personId, paymentStatus } = req.body;
    const userId = req.user.id;

    // ✅ Validation
    if (!products || !Array.isArray(products) || products.length === 0) {
      throw new Error("Products are required");
    }

    // ✅ Safe total calculation
    const total = products.reduce((sum, p) => {
      const price = Number(p.price) || 0;
      const qty = Number(p.quantity) || 0;
      return sum + price * qty;
    }, 0);

    if (total <= 0) {
      throw new Error("Invalid total amount");
    }

    // ✅ Create order (not saved yet)
    const order = new Order({
      userId,
      personId,
      products,
      total,
      paymentStatus,
      orderStatus: "pending",
      ledgerRecorded: paymentStatus === "debt", // pre-set
    });

    // ✅ Save order inside transaction
    await order.save({ session });

    // ✅ Handle debt safely
    if (paymentStatus === "debt" && personId) {
      await addDebtToPerson({
        personId,
        userId,
        amount: total,
        orderId: order._id,
        notes: "Auto from order",
        session, // 👈 pass session if your function supports it
      });
    }

    // ✅ Commit transaction
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
// Get Orders (User = own orders, Admin = all)
export async function getOrders(req, res) {
  try {
    const userId = req.user.id; // from auth middleware

    const orders = await Order.find({ userId })
      .populate("products.productId")
      .populate("personId", "name")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
// Get Single Order
export async function getOrderById(req, res) {
  try {
    const order = await Order.findById(req.params.id).populate(
      "products.productId",
    );

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Update Order
export async function updateOrder(req, res) {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const { paymentStatus, orderStatus } = req.body;

    // 🧠 Validate status transitions
    if (order.orderStatus === "completed" && orderStatus === "pending") {
      return res.status(400).json({
        error: "Cannot revert a completed order back to pending",
      });
    }

    // Update other fields explicitly
    if (orderStatus === "completed" && paymentStatus === "unpaid") {
      throw new Error("Completed order must be paid or debt");
    }
    if (orderStatus) order.orderStatus = orderStatus;

    // Now trigger ledger if completed
    if (
      !order.ledgerRecorded &&
      order.orderStatus === "completed" &&
      order.personId
    ) {
      if (order.paymentStatus === "debt") {
        await addDebtToPerson({
          personId: order.personId,
          userId: req.user.id,
          amount: order.total,
          orderId: order._id,
          notes: "Order converted to debt",
          paymentMethod: order.paymentMethod,
        });
      } else if (order.paymentStatus === "paid") {
        await addPaymentToPerson({
          personId: order.personId,
          userId: req.user.id,
          amount: order.total,
          notes: "Order fully paid",
          paymentMethod: order.paymentMethod,
        });
      }
      order.ledgerRecorded = true;
    }

    await order.save();

    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function markAsPaid(req, res) {
  const order = await Order.findById(req.params.id);

  if (!order) return res.status(404).json({ error: "Order not found" });

  order.paymentStatus = "paid";
  await order.save();

  res.json(order);
}

export async function markAsCompleted(req, res) {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });

  order.orderStatus = "completed";

  // Trigger ledger if needed
  if (!order.ledgerRecorded && order.personId) {
    if (order.paymentStatus === "debt") {
      await addDebtToPerson({
        personId: order.personId,
        userId: req.user.id,
        amount: order.total,
        orderId: order._id,
        notes: "Order converted to debt",
        paymentMethod: order.paymentMethod,
      });
    } else if (order.paymentStatus === "paid") {
      await addPaymentToPerson({
        personId: order.personId,
        userId: req.user.id,
        amount: order.total,
        notes: "Order fully paid",
        paymentMethod: order.paymentMethod,
      });
    }
    order.ledgerRecorded = true;
  }

  await order.save();
  res.json(order);
}

// Delete Order
export async function deleteOrder(req, res) {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    await order.deleteOne();

    res.json({ message: "Order deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
