import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getFinancialDashboard,
  getFinancialReport,
} from "../controllers/FinancialController.js";

const router = express.Router();

router.get("/dashboard", protect, getFinancialDashboard);
router.get("/report", protect, getFinancialReport);

export default router;
