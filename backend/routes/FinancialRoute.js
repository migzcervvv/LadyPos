import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getFinanceSummary } from "../controllers/FinancialController.js";

const router = express.Router();

router.get("/summary", protect, getFinanceSummary);
export default router;
