import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getFinancialDashboard,
  getDayDetails,
  getDebtorDetails,
} from "../controllers/FinancialController.js";

const router = express.Router();

router.get("/dashboard", protect, getFinancialDashboard);
router.get("/day/:date", protect, getDayDetails);
router.get("/debtor/:id", protect, getDebtorDetails);

export default router;
