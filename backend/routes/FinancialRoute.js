import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getFinanceSummary, getRevenueByRange, getSummary } from "../controllers/FinancialController.js";

const router = express.Router();

router.get("/summary", protect, getFinanceSummary);
router.get("/dashboard-summary", protect, getSummary);
router.get("/revenue", protect, getRevenueByRange);

export default router;
