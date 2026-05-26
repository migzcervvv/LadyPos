// src/features/profile/components/AdminUserTable.jsx
import { useState } from "react";
import { useAdminUsers } from "../../../shared/utils/useAdminUsers.js";
import { UserModal } from "./UserModal.jsx";
import { ConfirmModal } from "./ConfirmModal.jsx";

const COLS = [
  "Identifier",
  "Name",
  "Phone",
  "Role",
  "Confirmed",
  "Created",
  "Actions",
];

export function AdminUserTable() {
  const {
    users,
    loading,
    search,
    page,
    totalPages,
    formErrors,
    setFormErrors,
    handleSearchChange,
    setPage,
    saveUser,
    deleteUserById,
  } = useAdminUsers();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const openCreate = () => {
    setModalData(null);
    setFormErrors({});
    setModalOpen(true);
  };
  const openEdit = (u) => {
    setModalData(u);
    setFormErrors({});
    setModalOpen(true);
  };
  const openDelete = (u) => {
    setConfirmTarget(u);
    setConfirmOpen(true);
  };

  const handleSave = async (formData) => {
    setModalLoading(true);
    const ok = await saveUser(formData);
    setModalLoading(false);
    if (ok) setModalOpen(false);
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    const ok = await deleteUserById(confirmTarget._id);
    setDeleteLoading(false);
    if (ok) setConfirmOpen(false);
  };

  return (
    <>
      <div
        className="rounded-2xl shadow-sm border p-5"
        style={{
          backgroundColor: "var(--color-surface)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-semibold">User Management</h2>
          <button
            onClick={openCreate}
            className="btn-primary self-start sm:self-auto"
          >
            + Add User
          </button>
        </div>

        <input
          className="input w-full mb-4"
          placeholder="Search by identifier…"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
        />

        <div className="overflow-x-auto -mx-5 px-5">
          <table
            className="min-w-full text-sm"
            style={{ borderCollapse: "collapse" }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                {COLS.map((col) => (
                  <th
                    key={col}
                    className="text-left px-3 py-2 text-xs font-semibold uppercase tracking-wide whitespace-nowrap"
                    style={{ color: "var(--color-muted)" }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr
                    key={i}
                    style={{ borderBottom: "1px solid var(--color-border)" }}
                  >
                    {COLS.map((col) => (
                      <td key={col} className="px-3 py-3">
                        <div
                          className="h-4 rounded animate-pulse"
                          style={{
                            backgroundColor: "var(--color-border)",
                            width: col === "Actions" ? "80px" : "100%",
                          }}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={COLS.length}
                    className="text-center py-12 text-sm"
                    style={{ color: "var(--color-muted)" }}
                  >
                    {search ? "No users match your search." : "No users found."}
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u._id}
                    style={{ borderBottom: "1px solid var(--color-border)" }}
                  >
                    <td className="px-3 py-2 font-medium">{u.identifier}</td>
                    <td className="px-3 py-2">{u.name || "—"}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {u.phone || "—"}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          u.role === "admin"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          u.confirmed
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {u.confirmed ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(u)}
                          className="px-3 py-1 rounded text-xs font-medium"
                          style={{
                            backgroundColor: "var(--color-border)",
                            color: "var(--color-text)",
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openDelete(u)}
                          className="px-3 py-1 rounded text-xs font-medium bg-red-500 hover:bg-red-600 text-white"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div
            className="flex justify-center items-center gap-4 mt-4 pt-4"
            style={{ borderTop: "1px solid var(--color-border)" }}
          >
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="px-3 py-1.5 rounded text-sm disabled:opacity-40"
              style={{ backgroundColor: "var(--color-border)" }}
            >
              Previous
            </button>
            <span className="text-sm" style={{ color: "var(--color-muted)" }}>
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
              className="px-3 py-1.5 rounded text-sm disabled:opacity-40"
              style={{ backgroundColor: "var(--color-border)" }}
            >
              Next
            </button>
          </div>
        )}
      </div>

      <UserModal
        open={modalOpen}
        initialData={modalData}
        errors={formErrors}
        loading={modalLoading}
        onSave={handleSave}
        onClose={() => setModalOpen(false)}
      />

      <ConfirmModal
        open={confirmOpen}
        title="Delete User"
        message={`Delete "${confirmTarget?.identifier}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
