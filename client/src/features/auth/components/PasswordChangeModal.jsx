// src/features/profile/components/PasswordChangeModal.jsx
import { useState, useEffect } from "react";

const EMPTY = { currentPassword: "", newPassword: "", confirmPassword: "" };

export function PasswordChangeModal({
  open,
  loading,
  errors = {},
  onSave,
  onClose,
}) {
  const [form, setForm] = useState(EMPTY);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(EMPTY);
      setShow(false);
    }
  }, [open]);

  if (!open) return null;

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div
        className="w-full max-w-sm rounded-2xl shadow-xl p-6"
        style={{
          backgroundColor: "var(--color-surface)",
          color: "var(--color-text)",
          border: "1px solid var(--color-border)",
        }}
      >
        <h3 className="text-base font-semibold mb-4">Change Password</h3>

        <div className="space-y-3">
          <FormField label="Current Password" error={errors.currentPassword}>
            <input
              className="input w-full"
              type={show ? "text" : "password"}
              value={form.currentPassword}
              onChange={set("currentPassword")}
              disabled={loading}
              autoFocus
            />
          </FormField>
          <FormField label="New Password" error={errors.newPassword}>
            <input
              className="input w-full"
              type={show ? "text" : "password"}
              value={form.newPassword}
              onChange={set("newPassword")}
              disabled={loading}
            />
          </FormField>
          <FormField
            label="Confirm New Password"
            error={errors.confirmPassword}
          >
            <input
              className="input w-full"
              type={show ? "text" : "password"}
              value={form.confirmPassword}
              onChange={set("confirmPassword")}
              disabled={loading}
            />
          </FormField>
          <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              checked={show}
              onChange={(e) => setShow(e.target.checked)}
              className="w-4 h-4"
            />
            Show passwords
          </label>
        </div>

        <div
          className="flex justify-end gap-3 pt-4 mt-4"
          style={{ borderTop: "1px solid var(--color-border)" }}
        >
          <button
            onClick={onClose}
            disabled={loading}
            className="btn-secondary px-4 py-2 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={loading}
            className="btn-primary px-4 py-2 text-sm"
          >
            {loading ? "Updating…" : "Update Password"}
          </button>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, error, children }) {
  return (
    <div>
      <label
        className="block text-xs font-medium mb-1"
        style={{ color: "var(--color-muted)" }}
      >
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
