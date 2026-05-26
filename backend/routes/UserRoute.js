// backend/routes/userRoutes.js
import { Router } from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  createUser,
  loginUser,
  getProfile,
  updateProfile,
  updatePassword,
  getUsers,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";

const router = Router();

// ─── Public ──────────────────────────────────────────────────────────────────
router.post("/register", createUser);
router.post("/login", loginUser);

// ─── Self — MUST be registered before /:id ───────────────────────────────────
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.put("/password", protect, updatePassword);

// ─── Admin ───────────────────────────────────────────────────────────────────
router.get("/", protect, authorizeRoles("admin"), getUsers);
router.put("/:id", protect, authorizeRoles("admin"), updateUser);
router.delete("/:id", protect, authorizeRoles("admin"), deleteUser);

export default router;
