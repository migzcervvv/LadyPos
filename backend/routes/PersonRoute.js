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
  deleteDebt,
} from "../controllers/PersonController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.route("/").post(createPerson).get(getPeople);

router.route("/:id").get(getPersonById).put(updatePerson).delete(deletePerson);

router.post("/:id/debts", addDebt);
router.post("/:id/payments", addPayment);
router.post("/:id/pay-all", payAllDebts);

router.put("/:id/debts/:debtId", updateDebt);
router.delete("/:id/debts/:debtId", deleteDebt);

export default router;
