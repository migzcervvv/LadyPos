import express from "express";
import { getRevenueByRange, getSummary } from "../controllers/FinancialController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/summary", getSummary);
router.get("/revenue", getRevenueByRange);

export default router;
