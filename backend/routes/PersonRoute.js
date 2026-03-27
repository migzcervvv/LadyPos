import express from "express";
import {
  createPerson,
  getPeople,
  getPersonById,
  updatePerson,
  deletePerson,
  addDebt,
  addPayment,
  payAllDebts,
  updateDebt,
  deleteDebt
} from "../controllers/PersonController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

//
// PERSON
//
router.route("/")
  .post(createPerson)
  .get(getPeople);

router.route("/:id")
  .get(getPersonById)
  .put(updatePerson)
  .delete(deletePerson);

//
// TRANSACTIONS (ledger-based)
//

// Add debt (manual or from order)
router.post("/:id/debts", addDebt);

// Add payment
router.post("/:id/payments", addPayment);

// Pay all remaining balance
router.post("/:id/pay-all", payAllDebts);

// Update a specific debt/payment
router.put("/:id/debts/:debtId", updateDebt);

// Delete a specific debt/payment
router.delete("/:id/debts/:debtId", deleteDebt);

export default router;