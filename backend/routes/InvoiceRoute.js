import express from "express";
import {
  createInvoiceFromOrder,
  getOrCreateInvoice,
  getInvoices,
  getInvoiceById,
  markVoid,
} from "../controllers/InvoiceController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect);

router.post("/create/:orderId", createInvoiceFromOrder);
router.get("/", getInvoices);
router.get("/order/:orderId/ensure", getOrCreateInvoice);
router.get("/transaction/:transactionId/ensure", getOrCreateInvoice);
router.get("/:id", getInvoiceById);
router.patch("/:id/void", markVoid);

export default router;
