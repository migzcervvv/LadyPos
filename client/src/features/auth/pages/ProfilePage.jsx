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
    <div className="max-w-6xl mx-auto">
      {/* ========================= */}
      {/* PROFILE SECTION */}
      {/* ========================= */}
      <div className="max-w-3xl mx-auto space-y-6">
        {/* ================= PROFILE CARD ================= */}
        <div className="bg-white rounded-2xl shadow-sm border p-5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-semibold">Profile</h2>
              <p className="text-sm text-gray-500">
                Manage your personal information
              </p>
            </div>

            {!editingProfile && (
              <button
                className="text-sm px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200"
                onClick={() => setEditingProfile(true)}
              >
                Edit
              </button>
            )}
          </div>

          {editingProfile ? (
            <div className="grid grid-cols-1 gap-3">
              <input
                className="input"
                placeholder="Full name"
                value={profile.name}
                onChange={(e) =>
                  setProfile({ ...profile, name: e.target.value })
                }
              />

              <input
                className="input"
                placeholder="Phone number"
                value={profile.phone}
                maxLength={13}
                inputMode="numeric"
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
              />
              {formErrors.phone && (
                <p className="text-red-500 text-sm">{formErrors.phone}</p>
              )}
              <input
                className="input"
                placeholder="Address"
                value={profile.address}
                onChange={(e) =>
                  setProfile({ ...profile, address: e.target.value })
                }
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  className="btn-secondary"
                  onClick={() => setEditingProfile(false)}
                >
                  Cancel
                </button>

                <button className="btn-primary" onClick={handleProfileSave}>
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Name</p>
                <p className="font-medium">{profile.name || "-"}</p>
              </div>

              <div>
                <p className="text-gray-400">Phone</p>
                <p className="font-medium">{profile.phone || "-"}</p>
              </div>

              <div className="sm:col-span-2">
                <p className="text-gray-400">Address</p>
                <p className="font-medium">{profile.address || "-"}</p>
              </div>
            </div>
          )}
        </div>

        {/* ================= SECURITY CARD ================= */}
        <div className="bg-white rounded-2xl shadow-sm border p-5">
          <h2 className="text-lg font-semibold mb-4">Security</h2>

          {/* ================= IDENTIFIER ================= */}
          <div className="border-b py-3">
            <p className="text-sm text-gray-400 mb-1">Identifier</p>

            {editingIdentifier ? (
              <div className="flex gap-2">
                <input
                  className="input flex-1"
                  value={identifierValue}
                  onChange={(e) => setIdentifierValue(e.target.value)}
                />

                <button className="btn-primary" onClick={handleIdentifierSave}>
                  Save
                </button>

                <button
                  className="btn-secondary"
                  onClick={() => {
                    setEditingIdentifier(false);
                    setIdentifierValue(user.identifier);
                  }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <p className="font-medium">{identifierValue}</p>

                <button
                  className="btn-secondary"
                  onClick={() => setEditingIdentifier(true)}
                >
                  Edit
                </button>
              </div>
            )}
          </div>

          {/* ================= PASSWORD ================= */}
          <div className="py-3">
            <p className="text-sm text-gray-400 mb-1">Password</p>

            {editingPassword ? (
              <div className="flex gap-2">
                <input
                  className="input flex-1"
                  type={showPassword ? "text" : "password"}
                  value={passwordValue}
                  onChange={(e) => setPasswordValue(e.target.value)}
                />

                <button onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? "🙈" : "👁️"}
                </button>

                <button
                  className="btn-primary"
                  onClick={handlePasswordSave}
                  disabled={!passwordValue}
                >
                  Save
                </button>

                <button
                  className="btn-secondary"
                  onClick={() => {
                    setEditingPassword(false);
                    setPasswordValue("");
                    setShowPassword(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <p className="font-medium">••••••••</p>

                <button
                  className="btn-secondary"
                  onClick={() => setEditingPassword(true)}
                >
                  Change
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* ========================= */}
      {/* ADMIN SECTION */}
      {/* ========================= */}
      {user.role === "admin" && (
        <div>
          <h2 className="text-2xl font-bold my-4">Users Management</h2>

          <button
            className="mb-4 bg-[var(--color-primary)] text-white px-4 py-2 rounded"
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

          <div className="overflow-x-auto">
            <table className="min-w-full border rounded">
              <thead>
                <tr>
                  <th className="px-4 py-2">Identifier</th>
                  <th className="px-4 py-2">Role</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-t">
                    <td className="px-4 py-2">{u.identifier}</td>
                    <td className="px-4 py-2">{u.role}</td>
                    <td className="px-4 py-2 flex gap-2">
                      {u._id === user._id ? (
                        <span className="text-gray-400">Cannot edit self</span>
                      ) : (
                        <>
                          <button
                            className="bg-[var(--color-accent)] text-white px-3 py-1 rounded"
                            onClick={() => {
                              setSelectedUser(u);
                              setShowModal(true);
                            }}
                          >
                            Edit
                          </button>

                          <button
                            className="bg-red-500 text-white px-3 py-1 rounded"
                            onClick={() => handleDelete(u._id)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================= */}
      {/* MODAL */}
      {/* ========================= */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-[var(--color-surface)] p-6 rounded w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4">
              {selectedUser._id ? "Edit User" : "Create User"}
            </h2>
            {formErrors.general && (
              <div className="bg-red-100 text-red-700 p-2 rounded mb-3 text-sm">
                {formErrors.general}
              </div>
            )}
            <input
              className="w-full mb-1 p-2 border rounded"
              placeholder="Identifier"
              value={selectedUser.identifier}
              onChange={(e) =>
                setSelectedUser({
                  ...selectedUser,
                  identifier: e.target.value,
                })
              }
            />
            {formErrors.identifier && (
              <p className="text-red-500 text-sm mb-2">
                {formErrors.identifier}
              </p>
            )}

            <input
              className="w-full mb-1 p-2 border rounded"
              type="password"
              placeholder="Password"
              onChange={(e) =>
                setSelectedUser({
                  ...selectedUser,
                  password: e.target.value,
                })
              }
            />
            {formErrors.password && (
              <p className="text-red-500 text-sm mb-2">{formErrors.password}</p>
            )}
            <input
              className="w-full mb-1 p-2 border rounded"
              placeholder="Phone number"
              maxLength={13}
              inputMode="numeric"
              value={selectedUser.phone || ""} // ✅ ADD THIS
              onChange={(e) =>
                setSelectedUser({
                  ...selectedUser,
                  phone: e.target.value,
                })
              }
            />
            {formErrors.phone && (
              <p className="text-red-500 text-sm mb-2">{formErrors.phone}</p>
            )}
            <select
              className="w-full mb-3 p-2 border rounded"
              value={selectedUser.role}
              onChange={(e) =>
                setSelectedUser({
                  ...selectedUser,
                  role: e.target.value,
                })
              }
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>

            <label className="flex items-center mb-3 gap-2">
              <input
                type="checkbox"
                checked={selectedUser.confirmed}
                onChange={(e) =>
                  setSelectedUser({
                    ...selectedUser,
                    confirmed: e.target.checked,
                  })
                }
              />
              Confirmed
            </label>

            <div className="flex justify-end gap-2">
              <button
                className="bg-[var(--color-primary)] text-white px-4 py-1 rounded"
                onClick={() => handleSaveUser(selectedUser)}
              >
                Save
              </button>

              <button
                className="bg-[var(--color-muted)] px-4 py-1 rounded"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
