import express from "express";
import { createDebtPayment, getDebtPayments } from "../controllers/DebtPaymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.route("/").post(createDebtPayment).get(getDebtPayments);

export default router;
