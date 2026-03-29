import { useState, useEffect } from "react";
import { useAuth } from "../../../shared/hooks/AuthContext.jsx";
import {
  getUsers,
  registerUser,
  editUser,
  deleteUser,
} from "../../auth/api/authApi";

export default function ProfilePage() {
  const { user, jwt } = useAuth();

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [editingIdentifier, setEditingIdentifier] = useState(false);
  const [identifierValue, setIdentifierValue] = useState(user.identifier);

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
      let data;

      const payload = {
        identifier: u.identifier,
        role: u.role,
        confirmed: u.confirmed,
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
      console.error("Save failed", err);
    }
  };

  // =========================
  // SELF UPDATE (IDENTIFIER)
  // =========================
  const handleIdentifierSave = async () => {
    try {
      await editUser({ _id: user._id, identifier: identifierValue }, jwt);
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

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* ========================= */}
      {/* PROFILE SECTION */}
      {/* ========================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Identifier */}
        <div className="bg-[var(--color-surface)] p-4 rounded shadow flex justify-between">
          <div className="flex-1">
            <p className="font-semibold">Identifier</p>

            {editingIdentifier ? (
              <input
                className="border rounded p-2 mt-1 w-full"
                value={identifierValue}
                onChange={(e) => setIdentifierValue(e.target.value)}
              />
            ) : (
              <p className="mt-1">{identifierValue}</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            {editingIdentifier ? (
              <>
                <button
                  className="bg-[var(--color-primary)] text-white px-3 py-1 rounded"
                  onClick={handleIdentifierSave}
                >
                  Save
                </button>
                <button
                  className="bg-[var(--color-muted)] px-3 py-1 rounded"
                  onClick={() => {
                    setEditingIdentifier(false);
                    setIdentifierValue(user.identifier);
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                className="bg-[var(--color-accent)] text-white px-3 py-1 rounded"
                onClick={() => setEditingIdentifier(true)}
              >
                Edit
              </button>
            )}
          </div>
        </div>

        {/* Password */}
        <div className="bg-[var(--color-surface)] p-4 rounded shadow flex justify-between">
          <div className="flex-1">
            <p className="font-semibold">Password</p>

            {editingPassword ? (
              <input
                className="border rounded p-2 mt-1 w-full"
                type={showPassword ? "text" : "password"}
                value={passwordValue}
                onChange={(e) => setPasswordValue(e.target.value)}
              />
            ) : (
              <p className="mt-1">{"•".repeat(8)}</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            {editingPassword ? (
              <>
                <button onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? "🙈" : "👁️"}
                </button>
                <button
                  className="bg-[var(--color-primary)] text-white px-3 py-1 rounded"
                  onClick={handlePasswordSave}
                  disabled={!passwordValue}
                >
                  Save
                </button>
                <button
                  className="bg-[var(--color-muted)] px-3 py-1 rounded"
                  onClick={() => {
                    setEditingPassword(false);
                    setPasswordValue("");
                    setShowPassword(false);
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                className="bg-[var(--color-accent)] text-white px-3 py-1 rounded"
                onClick={() => setEditingPassword(true)}
              >
                Edit
              </button>
            )}
          </div>
        </div>

        {/* Role */}
        <div className="bg-[var(--color-surface)] p-4 rounded shadow">
          <p className="font-semibold">Role</p>
          <p className="mt-1">{user.role}</p>
        </div>
      </div>

      {/* ========================= */}
      {/* ADMIN SECTION */}
      {/* ========================= */}
      {user.role === "admin" && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Users Management</h2>

          <button
            className="mb-4 bg-[var(--color-primary)] text-white px-4 py-2 rounded"
            onClick={() => {
              setSelectedUser({
                identifier: "",
                password: "",
                role: "user",
                confirmed: false,
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

            <input
              className="w-full mb-3 p-2 border rounded"
              placeholder="Identifier"
              value={selectedUser.identifier}
              onChange={(e) =>
                setSelectedUser({
                  ...selectedUser,
                  identifier: e.target.value,
                })
              }
            />

            <input
              className="w-full mb-3 p-2 border rounded"
              type="password"
              placeholder="Password"
              onChange={(e) =>
                setSelectedUser({
                  ...selectedUser,
                  password: e.target.value,
                })
              }
            />

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
