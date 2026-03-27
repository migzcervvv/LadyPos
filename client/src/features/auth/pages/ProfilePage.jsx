import { useState, useEffect } from "react";
import { useAuth } from "../../../shared/hooks/AuthContext.jsx";

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

  const url = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (user?.role !== "admin") return;

    const fetchUsers = async () => {
      try {
        const res = await fetch(`${url}/users`, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };

    fetchUsers();
  }, [user, jwt]);

  const handleDelete = async (id) => {
    try {
      await fetch(`${url}/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${jwt}` },
      });
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleUpdate = async (u) => {
    try {
      await fetch(`${url}/users/${u._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          identifier: u.identifier,
          password: u.password,
          confirmed: u.confirmed,
        }),
      });
      setUsers((prev) => prev.map((user) => (user._id === u._id ? u : user)));
      setShowModal(false);
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const handleIdentifierSave = async () => {
    try {
      await fetch(`${url}/users/${user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({ identifier: identifierValue }),
      });
      setEditingIdentifier(false);
    } catch (err) {
      console.error("Failed to update identifier:", err);
    }
  };

  const handlePasswordSave = async () => {
    try {
      await fetch(`${url}/users/${user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({ password: passwordValue }),
      });
      setPasswordValue("");
      setShowPassword(false);
      setEditingPassword(false);
    } catch (err) {
      console.error("Failed to update password:", err);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* User Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Identifier Card */}
        <div className="bg-[var(--color-surface)] p-4 rounded shadow flex flex-col md:flex-row items-start md:items-center justify-between">
          <div className="flex-1">
            <p className="font-semibold">Identifier</p>
            {editingIdentifier ? (
              <input
                className="border rounded p-2 mt-1 w-full"
                value={identifierValue}
                onChange={(e) => setIdentifierValue(e.target.value)}
              />
            ) : (
              <p className="break-words mt-1">{identifierValue}</p>
            )}
          </div>
          <div className="flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-1 mt-2 md:mt-0">
            {editingIdentifier ? (
              <>
                <button
                  className="bg-[var(--color-primary)] text-white px-3 py-1 rounded hover:brightness-110 transition"
                  onClick={handleIdentifierSave}
                >
                  Save
                </button>
                <button
                  className="bg-[var(--color-muted)] px-3 py-1 rounded hover:brightness-90 transition"
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
                className="bg-[var(--color-accent)] text-white px-3 py-1 rounded hover:brightness-110 transition"
                onClick={() => setEditingIdentifier(true)}
              >
                Edit
              </button>
            )}
          </div>
        </div>

        {/* Password Card */}
        <div className="bg-[var(--color-surface)] p-4 rounded shadow flex flex-col md:flex-row items-start md:items-center justify-between">
          <div className="flex-1">
            <p className="font-semibold">Password</p>
            {editingPassword ? (
              <input
                className="border rounded p-2 mt-1 w-full"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={passwordValue}
                onChange={(e) => setPasswordValue(e.target.value)}
              />
            ) : (
              <p className="mt-1">{"•".repeat(8)}</p>
            )}
          </div>
          <div className="flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-1 mt-2 md:mt-0">
            {editingPassword ? (
              <>
                <button
                  className="px-2 bg-[var(--color-muted)] rounded hover:brightness-90 transition"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
                <button
                  className="bg-[var(--color-primary)] text-white px-3 py-1 rounded hover:brightness-110 transition"
                  onClick={handlePasswordSave}
                  disabled={!passwordValue}
                >
                  Save
                </button>
                <button
                  className="bg-[var(--color-muted)] px-3 py-1 rounded hover:brightness-90 transition"
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
                className="bg-[var(--color-accent)] text-white px-3 py-1 rounded hover:brightness-110 transition"
                onClick={() => setEditingPassword(true)}
              >
                Edit
              </button>
            )}
          </div>
        </div>

        {/* Role Card */}
        <div className="bg-[var(--color-surface)] p-4 rounded shadow flex flex-col justify-between">
          <p className="font-semibold">Role</p>
          <p className="mt-1">{user.role}</p>
        </div>
      </div>

      {/* Admin Section */}
      {user.role === "admin" && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Users Management</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-[var(--color-border)] rounded-lg text-left">
              <thead className="bg-[var(--color-secondary)]">
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
                    className="border-t border-[var(--color-border)] hover:bg-[var(--color-bg)]"
                  >
                    <td className="px-4 py-2 break-words">{u.identifier}</td>
                    <td className="px-4 py-2">{u.role}</td>
                    <td className="px-4 py-2 flex flex-wrap gap-2">
                      {u._id === user._id ? (
                        <span className="text-[var(--color-muted)]">
                          Cannot edit/delete self
                        </span>
                      ) : (
                        <>
                          <button
                            className="bg-[var(--color-accent)] text-white px-3 py-1 rounded hover:brightness-110 transition"
                            onClick={() => {
                              setSelectedUser(u);
                              setShowModal(true);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="bg-red-500 text-white px-3 py-1 rounded hover:brightness-110 transition"
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

      {/* Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-surface)] p-6 rounded-xl w-full max-w-sm shadow-lg">
            <h2 className="text-xl font-bold mb-4">Edit User</h2>

            <input
              className="w-full mb-3 p-2 border rounded"
              value={selectedUser.identifier}
              onChange={(e) =>
                setSelectedUser({ ...selectedUser, identifier: e.target.value })
              }
            />
            <input
              className="w-full mb-3 p-2 border rounded"
              type="password"
              placeholder="New Password"
              onChange={(e) =>
                setSelectedUser({ ...selectedUser, password: e.target.value })
              }
            />
            <label className="flex items-center mb-3 space-x-2">
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
              <span>Confirmed</span>
            </label>

            <div className="flex justify-end flex-wrap gap-2">
              <button
                className="bg-[var(--color-primary)] text-white px-4 py-1 rounded hover:brightness-110 transition"
                onClick={() => handleUpdate(selectedUser)}
              >
                Save
              </button>
              <button
                className="bg-[var(--color-muted)] px-4 py-1 rounded hover:brightness-90 transition"
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
