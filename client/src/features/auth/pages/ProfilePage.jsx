import { useState, useEffect } from "react";
import { useAuth } from "../../../shared/hooks/AuthContext.jsx";
import {
  getUsers,
  registerUser,
  editUser,
  deleteUser,
} from "../../auth/api/authApi";

export default function ProfilePage() {
  const { user, jwt, setUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [editingIdentifier, setEditingIdentifier] = useState(false);
  const [identifierValue, setIdentifierValue] = useState(user.identifier);
  const [profile, setProfile] = useState({
    name: user.name || "",
    phone: user.phone || "",
    address: user.address || "",
  });

  const [editingProfile, setEditingProfile] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const [editingPassword, setEditingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // =========================
  // FETCH USERS (ADMIN ONLY)
  // =========================
  useEffect(() => {
    if (user?.role !== "admin") return;

    const fetchUsers = async () => {
      try {
        const data = await getUsers(jwt);
        setUsers(data);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };

    fetchUsers();
  }, [user, jwt]);

  useEffect(() => {
    if (!user) return;
    setProfile({
      name: user.name || "",
      phone: user.phone || "",
      address: user.address || "",
    });

    setIdentifierValue(user.identifier);
  }, [user]);

  const validateUser = (u, isEdit = false) => {
    const errors = {};

    if (!u.identifier || u.identifier.trim().length < 3) {
      errors.identifier = "Identifier must be at least 3 characters";
    }

    if (!isEdit && (!u.password || u.password.length < 6)) {
      errors.password = "Password must be at least 6 characters";
    }

    // 🔥 REQUIRED PHONE ON CREATE
    if (!u.phone || u.phone.trim() === "") {
      errors.phone = "Phone number is required";
    } else {
      const normalized = normalizePHPhone(u.phone);
      if (!isValidPHPhone(normalized)) {
        errors.phone = "Enter a valid PH number (09XXXXXXXXX or +639XXXXXXXXX)";
      }
    }

    return errors;
  };

  // =========================
  // DELETE USER
  // =========================
  const handleDelete = async (id) => {
    try {
      await deleteUser(id, jwt);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  // =========================
  // CREATE / UPDATE USER
  // =========================
  const handleSaveUser = async (u) => {
    try {
      const isEdit = !!u._id;

      const errors = validateUser(u, isEdit);
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      setFormErrors({});

      let data;

      const normalizedPhone = normalizePHPhone(u.phone);

      const payload = {
        identifier: u.identifier.toLowerCase(),
        role: u.role,
        confirmed: u.confirmed,
        name: u.name ?? null,
        phone: normalizedPhone,
        address: u.address ?? null,
      };

      if (u.password) {
        payload.password = u.password;
      }

      if (u._id) {
        data = await editUser({ ...payload, _id: u._id }, jwt);
        setUsers((prev) =>
          prev.map((user) => (user._id === data._id ? data : user)),
        );
      } else {
        data = await registerUser(payload, jwt);
        setUsers((prev) => [...prev, data]);
      }

      setShowModal(false);
    } catch (err) {
      console.error("Save failed", err.response?.data || err.message);

      setFormErrors({
        general:
          err.response?.data?.message ||
          "Something went wrong. Please try again.",
      });
    }
  };

  // =========================
  // SELF UPDATE (IDENTIFIER)
  // =========================
  const handleIdentifierSave = async () => {
    try {
      const updatedUser = await editUser(
        { _id: user._id, identifier: identifierValue },
        jwt,
      );

      setUser((prev) => ({
        ...prev,
        identifier: updatedUser.identifier || identifierValue,
      }));

      setEditingIdentifier(false);
    } catch (err) {
      console.error("Failed to update identifier:", err);
    }
  };

  // =========================
  // SELF UPDATE (PASSWORD)
  // =========================
  const handlePasswordSave = async () => {
    try {
      await editUser({ _id: user._id, password: passwordValue }, jwt);

      setPasswordValue("");
      setShowPassword(false);
      setEditingPassword(false);
    } catch (err) {
      console.error("Failed to update password:", err);
    }
  };

  const normalizePHPhone = (phone) => {
    if (!phone) return "";

    let cleaned = phone.replace(/\s+/g, "");

    if (cleaned.startsWith("0")) {
      cleaned = "+63" + cleaned.substring(1);
    }

    if (cleaned.startsWith("63")) {
      cleaned = "+" + cleaned;
    }

    return cleaned;
  };

  const isValidPHPhone = (phone) => {
    // Must be +639XXXXXXXXX
    return /^\+639\d{9}$/.test(phone);
  };

  const handleProfileSave = async () => {
    try {
      const errors = {};

      if (!profile.phone || profile.phone.trim() === "") {
        errors.phone = "Phone number is required";
      } else {
        const normalizedPhone = normalizePHPhone(profile.phone);
        if (!isValidPHPhone(normalizedPhone)) {
          errors.phone =
            "Enter a valid PH number (09XXXXXXXXX or +639XXXXXXXXX)";
        }
      }

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      setFormErrors({});

      const normalizedPhone = normalizePHPhone(profile.phone);

      const updatedUser = await editUser(
        {
          _id: user._id,
          name: profile.name,
          phone: normalizedPhone,
          address: profile.address,
        },
        jwt,
      );

      // 🔥 CRITICAL FIX: update global user
      setUser((prev) => ({
        ...prev,
        ...updatedUser,
        _id: updatedUser.id || prev._id,
      }));

      setEditingProfile(false);
    } catch (err) {
      console.error("Failed to update profile:", err);

      setFormErrors({
        general: "Failed to update profile. Try again.",
      });
    }
  };
  return (
    <div
      className="max-w-6xl mx-auto"
      style={{
        backgroundColor: "var(--color-bg)",
        color: "var(--color-text)",
        minHeight: "100vh",
      }}
    >
      {/* PROFILE + SECURITY */}
      <div className="max-w-3xl mx-auto space-y-6 py-6">
        {/* PROFILE CARD */}
        <div
          className="rounded-2xl shadow-sm border p-5"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-border)",
          }}
        >
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-semibold">Profile</h2>
              <p style={{ color: "var(--color-muted)" }}>
                Manage your personal information
              </p>
            </div>

            {!editingProfile && (
              <button
                onClick={() => setEditingProfile(true)}
                className="px-3 py-1.5 rounded-lg"
                style={{
                  backgroundColor: "var(--color-border)",
                }}
              >
                Edit
              </button>
            )}
          </div>

          {editingProfile ? (
            <div className="grid gap-3">
              <input
                className="input"
                placeholder="Full name"
                value={profile.name}
              />

              <input
                className="input"
                placeholder="Phone number"
                value={profile.phone}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
              />

              <input
                className="input"
                placeholder="Address"
                value={profile.address}
                onChange={(e) =>
                  setProfile({ ...profile, address: e.target.value })
                }
              />

              <div className="flex justify-end gap-2 pt-2">
                <button className="btn-secondary">Cancel</button>
                <button className="btn-primary">Save Changes</button>
              </div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p style={{ color: "var(--color-muted)" }}>Name</p>
                <p className="font-medium">{profile.name || "-"}</p>
              </div>

              <div>
                <p style={{ color: "var(--color-muted)" }}>Phone</p>
                <p className="font-medium">{profile.phone || "-"}</p>
              </div>

              <div className="sm:col-span-2">
                <p style={{ color: "var(--color-muted)" }}>Address</p>
                <p className="font-medium">{profile.address || "-"}</p>
              </div>
            </div>
          )}
        </div>

        {/* SECURITY CARD */}
        <div
          className="rounded-2xl shadow-sm border p-5"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-border)",
          }}
        >
          <h2 className="text-lg font-semibold mb-4">Security</h2>

          <div
            className="py-3 border-b"
            style={{ borderColor: "var(--color-border)" }}
          >
            <p style={{ color: "var(--color-muted)" }}>Identifier</p>

            <div className="flex justify-between items-center">
              <p className="font-medium">{identifierValue}</p>

              <button
                onClick={() => setEditingIdentifier(true)}
                className="px-3 py-1 rounded"
                style={{ backgroundColor: "var(--color-border)" }}
              >
                Edit
              </button>
            </div>
          </div>

          <div className="py-3">
            <p style={{ color: "var(--color-muted)" }}>Password</p>

            <div className="flex justify-between items-center">
              <p className="font-medium">••••••••</p>

              <button
                onClick={() => setEditingPassword(true)}
                className="px-3 py-1 rounded"
                style={{ backgroundColor: "var(--color-border)" }}
              >
                Change
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ADMIN */}
      {user.role === "admin" && (
        <div className="mt-6">
          <h2 className="text-2xl font-bold mb-4">Users Management</h2>

          <button
            className="px-4 py-2 rounded text-white"
            style={{ backgroundColor: "var(--color-primary)" }}
            onClick={() => {
              setSelectedUser({
                identifier: "",
                password: "",
                role: "user",
                confirmed: false,
                phone: "",
              });
              setShowModal(true);
            }}
          >
            + Add User
          </button>

          <div className="overflow-x-auto mt-4">
            <table
              className="min-w-full rounded"
              style={{
                border: `1px solid var(--color-border)`,
              }}
            >
              <thead style={{ backgroundColor: "var(--color-surface)" }}>
                <tr>
                  <th className="px-4 py-2">Identifier</th>
                  <th className="px-4 py-2">Role</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((u) => (
                  <tr
                    key={u._id}
                    style={{
                      borderTop: `1px solid var(--color-border)`,
                    }}
                  >
                    <td className="px-4 py-2">{u.identifier}</td>
                    <td className="px-4 py-2">{u.role}</td>

                    <td className="px-4 py-2 flex gap-2">
                      <button
                        className="px-3 py-1 rounded text-white"
                        style={{
                          backgroundColor: "var(--color-accent)",
                        }}
                      >
                        Edit
                      </button>

                      <button className="bg-red-500 text-white px-3 py-1 rounded">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
