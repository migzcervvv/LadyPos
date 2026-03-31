import express from "express";
import {
  createInvoiceFromOrder,
  getOrCreateInvoice,
  getInvoices,
} from "../controllers/InvoiceController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect);

router.post("/create/:orderId", createInvoiceFromOrder);
router.get("/", getInvoices);
// 🔥 smart get (create if missing)
router.get("/order/:orderId/ensure", getOrCreateInvoice);

export default router;
