import { Router } from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  setActiveProducts,
  adjustStock,
} from "../controllers/ProductController.js";

import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);

router
  .route("/")
  .post(authorizeRoles("admin", "user"), createProduct)
  .get(authorizeRoles("admin", "user"), getProducts);

router
  .route("/:id")
  .get(authorizeRoles("admin", "user"), getProductById)
  .put(authorizeRoles("admin", "user"), updateProduct)
  .delete(authorizeRoles("admin", "user"), deleteProduct);

router.patch("/:id/stock", authorizeRoles("admin", "user"), adjustStock);
router.post("/set-active", protect, setActiveProducts);

export default router;
