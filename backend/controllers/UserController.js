// backend/controllers/userController.js
import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import bcrypt from "bcryptjs";

// ─── Public ──────────────────────────────────────────────────────────────────

// POST /api/users/register
export const createUser = asyncHandler(async (req, res) => {
  const { identifier, password, phone, name, address } = req.body;

  if (!identifier || !password) {
    res.status(400);
    throw new Error("Identifier and password are required");
  }

  const exists = await User.findOne({ identifier: identifier.toLowerCase() });
  if (exists) {
    res.status(409);
    throw new Error("User already exists");
  }

  const user = await User.create({
    identifier: identifier.toLowerCase(),
    password, // pre-save hook hashes
    role: req.body.role || "user",
    confirmed: req.body.confirmed ?? false,
    name: name ?? null,
    phone: phone ?? null,
    address: address ?? null,
  });

  res.status(201).json({
    _id: user._id,
    identifier: user.identifier,
    role: user.role,
    confirmed: user.confirmed,
    name: user.name,
    phone: user.phone,
    address: user.address,
    createdAt: user.createdAt,
    token: await generateToken(user),
  });
});

// POST /api/users/login
export const loginUser = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    res.status(400);
    throw new Error("Identifier and password are required");
  }

  const user = await User.findOne({ identifier: identifier.toLowerCase() });
  const passwordCorrect = user
    ? await bcrypt.compare(password, user.password)
    : false;

  if (!user || !passwordCorrect) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  if (!user.confirmed) {
    res.status(403);
    throw new Error("Account not confirmed");
  }

  res.json({
    _id: user._id,
    identifier: user.identifier,
    role: user.role,
    confirmed: user.confirmed,
    name: user.name,
    phone: user.phone,
    address: user.address,
    createdAt: user.createdAt,
    token: await generateToken(user),
  });
});

// ─── Self (authenticated) ─────────────────────────────────────────────────────

// GET /api/users/profile
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json(user);
});

// PUT /api/users/profile
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const { name, phone, address, identifier } = req.body;

  if (identifier !== undefined) {
    const taken = await User.findOne({
      identifier: identifier.toLowerCase().trim(),
      _id: { $ne: user._id },
    });
    if (taken) {
      res.status(409);
      throw new Error("Identifier already taken");
    }
    user.identifier = identifier.toLowerCase().trim();
  }

  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (address !== undefined) user.address = address;

  const updated = await user.save();
  const result = updated.toObject();
  delete result.password;
  res.json(result);
});

// PUT /api/users/password
export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error("Current and new password are required");
  }
  if (newPassword.length < 6) {
    res.status(400);
    throw new Error("Password must be at least 6 characters");
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (!(await user.matchPassword(currentPassword))) {
    res.status(401);
    throw new Error("Current password is incorrect");
  }

  user.password = newPassword; // pre-save hook hashes
  await user.save();
  res.json({ message: "Password updated" });
});

// ─── Admin ───────────────────────────────────────────────────────────────────

// GET /api/users
export const getUsers = asyncHandler(async (req, res) => {
  const { search = "", page = 1, limit = 10 } = req.query;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

  const query = search.trim()
    ? { identifier: { $regex: search.trim(), $options: "i" } }
    : {};

  const [users, total] = await Promise.all([
    User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    User.countDocuments(query),
  ]);

  res.json({
    users,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
  });
});

// PUT /api/users/:id
export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const { identifier, role, confirmed, name, phone, address, password } =
    req.body;

  if (identifier !== undefined)
    user.identifier = identifier.toLowerCase().trim();
  if (role !== undefined) user.role = role;
  if (confirmed !== undefined) user.confirmed = confirmed;
  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (address !== undefined) user.address = address;
  if (password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
  }
  const updated = await user.save();
  const result = updated.toObject();
  delete result.password;
  res.json(result);
});

// DELETE /api/users/:id
export const deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    res.status(400);
    throw new Error("Cannot delete your own account");
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  await user.deleteOne();
  res.json({ message: "User deleted" });
});
