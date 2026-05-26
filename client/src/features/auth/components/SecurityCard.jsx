// src/features/profile/components/SecurityCard.jsx
import { useState, useEffect } from "react";
import { useProfile } from "../../../shared/utils/useProfile.js";
import { PasswordChangeModal } from "./PasswordChangeModal.jsx";

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

export function SecurityCard() {
  const {
    user,
    identifierLoading,
    passwordLoading,
    identifierError,
    passwordErrors,
    setPasswordErrors,
    saveIdentifier,
    savePassword,
  } = useProfile();

  const [editingId, setEditingId] = useState(false);
  const [idValue, setIdValue] = useState("");
  const [pwModalOpen, setPwModalOpen] = useState(false);

  useEffect(() => {
    if (user?.identifier) setIdValue(user.identifier);
  }, [user?.identifier]);

  const handleIdSave = async () => {
    const success = await saveIdentifier(idValue);
    if (success) setEditingId(false);
  };

  const handleIdCancel = () => {
    setIdValue(user?.identifier || "");
    setEditingId(false);
  };

  const handlePasswordSave = async (formData) => {
    const success = await savePassword(formData);
    if (success) {
      setPwModalOpen(false);
      setPasswordErrors({});
    }
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
        <h2 className="text-lg font-semibold mb-4">Account & Security</h2>

        {/* Meta */}
        <div
          className="grid sm:grid-cols-3 gap-4 text-sm pb-4 mb-4"
          style={{ borderBottom: "1px solid var(--color-border)" }}
        >
          <div>
            <p
              className="text-xs font-medium mb-1"
              style={{ color: "var(--color-muted)" }}
            >
              Role
            </p>
            <span
              className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                user?.role === "admin"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {user?.role}
            </span>
          </div>
          <div>
            <p
              className="text-xs font-medium mb-1"
              style={{ color: "var(--color-muted)" }}
            >
              Status
            </p>
            <span
              className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                user?.confirmed
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {user?.confirmed ? "Confirmed" : "Unconfirmed"}
            </span>
          </div>
          <div>
            <p
              className="text-xs font-medium mb-1"
              style={{ color: "var(--color-muted)" }}
            >
              Member since
            </p>
            <p className="font-medium text-sm">{formatDate(user?.createdAt)}</p>
          </div>
        </div>

        {/* Identifier */}
        <div
          className="py-3"
          style={{ borderBottom: "1px solid var(--color-border)" }}
        >
          <p
            className="text-xs font-medium mb-1.5"
            style={{ color: "var(--color-muted)" }}
          >
            Identifier
          </p>
          {editingId ? (
            <div className="space-y-1.5">
              <div className="flex gap-2">
                <input
                  className="input flex-1"
                  value={idValue}
                  onChange={(e) => setIdValue(e.target.value)}
                  disabled={identifierLoading}
                  autoFocus
                />
                <button
                  onClick={handleIdSave}
                  disabled={identifierLoading}
                  className="btn-primary px-3 py-1.5 text-sm whitespace-nowrap"
                >
                  {identifierLoading ? "Saving…" : "Save"}
                </button>
                <button
                  onClick={handleIdCancel}
                  disabled={identifierLoading}
                  className="btn-secondary px-3 py-1.5 text-sm"
                >
                  Cancel
                </button>
              </div>
              {identifierError && (
                <p className="text-xs text-red-500">{identifierError}</p>
              )}
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium">{user?.identifier}</p>
              <button
                onClick={() => setEditingId(true)}
                className="px-3 py-1 rounded text-sm"
                style={{ backgroundColor: "var(--color-border)" }}
              >
                Edit
              </button>
            </div>
          )}
        </div>

        {/* Password */}
        <div className="pt-3">
          <p
            className="text-xs font-medium mb-1.5"
            style={{ color: "var(--color-muted)" }}
          >
            Password
          </p>
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium tracking-widest">••••••••</p>
            <button
              onClick={() => setPwModalOpen(true)}
              className="px-3 py-1 rounded text-sm"
              style={{ backgroundColor: "var(--color-border)" }}
            >
              Change
            </button>
          </div>
        </div>
      </div>

      <PasswordChangeModal
        open={pwModalOpen}
        loading={passwordLoading}
        errors={passwordErrors}
        onSave={handlePasswordSave}
        onClose={() => {
          setPwModalOpen(false);
          setPasswordErrors({});
        }}
      />
    </>
  );
}
