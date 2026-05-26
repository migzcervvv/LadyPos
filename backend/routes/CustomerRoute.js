import express from "express";
import {
  createCustomer,
  deleteCustomer,
  getCustomerById,
  getCustomers,
  updateCustomer,
} from "../controllers/PersonController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.route("/").post(createCustomer).get(getCustomers);
router.route("/:id").get(getCustomerById).put(updateCustomer).delete(deleteCustomer);

export default router;
