import { Router } from "express";
import {
  createTransaction,
  getTransactionById,
  getTransactions,
  markAsPaid,
  voidTransaction,
} from "../controllers/OrderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);
router.route("/").post(createTransaction).get(getTransactions);
router.get("/:id", getTransactionById);
router.patch("/:id/pay", markAsPaid);
router.patch("/:id/void", voidTransaction);

export default router;
