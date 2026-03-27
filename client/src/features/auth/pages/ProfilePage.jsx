import { useState, useEffect } from "react";
import { useAuth } from "../../../shared/hooks/AuthContext.jsx";

export default function ProfilePage() {
  const { user, jwt } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
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

  const handleUpdate = async () => {
    try {
      await fetch(`${url}/users/${selectedUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          identifier: selectedUser.identifier,
          password: selectedUser.password,
          confirmed: selectedUser.confirmed,
        }),
      });

      setUsers((prev) =>
        prev.map((u) => (u._id === selectedUser._id ? selectedUser : u)),
      );
      setShowModal(false);
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 capitalize">{user.identifier}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded shadow">
          <p className="font-semibold">Identifier</p>
          <p className="wrap-break-word">{user.identifier}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="font-semibold">Password</p>
          <p>{"•".repeat(8)}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="font-semibold">Role</p>
          <p>{user.role}</p>
        </div>
      </div>

      {user.role === "admin" && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Users Management</h2>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg text-left">
              <thead className="bg-gray-100">
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
                    className="border-t border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-4 py-2 break-words">{u.identifier}</td>
                    <td className="px-4 py-2">{u.role}</td>
                    <td className="px-4 py-2 space-x-2">
                      <button
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                        onClick={() => {
                          setSelectedUser(u);
                          setShowModal(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        onClick={() => handleDelete(u._id)}
                      >
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

      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm shadow-lg">
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

            <div className="flex justify-end space-x-2">
              <button
                className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600"
                onClick={handleUpdate}
              >
                Save
              </button>
              <button
                className="bg-gray-300 px-4 py-1 rounded hover:bg-gray-400"
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
