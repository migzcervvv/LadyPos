import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
// Create a new user
export async function createUser(req, res) {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res
        .status(400)
        .json({ message: "Identifier and password are required" });
    }
    const userExists = await User.findOne({
      identifier: identifier.toLowerCase(),
    });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      identifier: identifier.toLowerCase(),
      password: hashedPassword,
      role: "user", // default role
      confirmed: false, // default confirmation status
    });

    res.status(201).json({
      _id: user._id,
      identifier: user.identifier,
      role: user.role,
      token: await generateToken(user),
      confirmed: user.confirmed,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// LOGIN
export async function loginUser(req, res) {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res
        .status(400)
        .json({ message: "Identifier and password are required" });
    }
    const user = await User.findOne({ identifier: identifier.toLowerCase() });
    const passwordCorrect = user
      ? await bcrypt.compare(password, user.password)
      : false;
    const userConfirmed = user ? user.confirmed : false;
    if (user && passwordCorrect && userConfirmed) {
      res.json({
        _id: user._id,
        identifier: user.identifier,
        role: user.role,
        token: await generateToken(user),
        confirmed: user.confirmed,
        name: user.name,
        phone: user.phone,
        address: user.address,
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message });
  }
}

// Get all users
export async function getUsers(req, res) {
  try {
    const users = await User.find(); // use the method on the model
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get user by ID
export async function getUserById(req, res) {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ error: "User not found" });

    // 🔒 Only allow if:
    // - user is requesting themselves
    // - OR is admin
    if (req.user.id !== user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Update user
export async function updateUser(req, res) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Only allow self-update or admin
    if (req.user.id !== user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    // Update identifier if provided
    if (req.body.identifier) user.identifier = req.body.identifier;

    // Update password if provided (and hash it)
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }
    if (req.body.name !== undefined) user.name = req.body.name;
    if (req.body.phone !== undefined) user.phone = req.body.phone;
    if (req.body.address !== undefined) user.address = req.body.address;
    // Update confirmed field if provided
    if (typeof req.body.confirmed === "boolean") {
      user.confirmed = req.body.confirmed;
    }

    // Only admin can change role
    if (req.body.role && req.user.role === "admin") {
      user.role = req.body.role;
    }

    await user.save(); // triggers pre-save hooks, including hashing
    res.json({
      id: user._id,
      identifier: user.identifier,
      role: user.role,
      confirmed: user.confirmed,
      name: user.name,
      phone: user.phone,
      address: user.address,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// Delete user
export async function deleteUser(req, res) {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ error: "User not found" });

    // Only admin can delete (already enforced in route, but double check is good)
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    await user.deleteOne();

    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
