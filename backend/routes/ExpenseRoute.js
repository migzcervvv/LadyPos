import express from "express";
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from "../controllers/ExpenseController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();
router.use(protect);

router.post("/", createExpense);
router.get("/", getExpenses);
router.put("/:id", updateExpense);
router.delete("/:id", deleteExpense);
export default router;
