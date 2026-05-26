// src/features/profile/components/ProfileCard.jsx
import { useState, useEffect } from "react";
import { useProfile } from "../../../shared/utils/useProfile.js";

export function ProfileCard() {
  const { user, profileLoading, profileErrors, setProfileErrors, saveProfile } =
    useProfile();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "" });

  // Sync form when user data changes (e.g. after external update)
  useEffect(() => {
    if (user && !editing) {
      setForm({
        name: user.name || "",
        phone: user.phone || "",
        address: user.address || "",
      });
    }
  }, [user, editing]);

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSave = async () => {
    const success = await saveProfile(form);
    if (success) setEditing(false);
  };

  const handleCancel = () => {
    setForm({
      name: user.name || "",
      phone: user.phone || "",
      address: user.address || "",
    });
    setProfileErrors({});
    setEditing(false);
  };

  return (
    <div
      className="rounded-2xl shadow-sm border p-5"
      style={{
        backgroundColor: "var(--color-surface)",
        borderColor: "var(--color-border)",
      }}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-lg font-semibold">Profile</h2>
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>
            Personal information
          </p>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="px-3 py-1.5 rounded-lg text-sm"
            style={{
              backgroundColor: "var(--color-border)",
              color: "var(--color-text)",
            }}
          >
            Edit
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-3">
          <FormField label="Full Name" error={profileErrors.name}>
            <input
              className="input w-full"
              placeholder="Full name"
              value={form.name}
              onChange={set("name")}
              disabled={profileLoading}
              autoFocus
            />
          </FormField>
          <FormField label="Phone" error={profileErrors.phone}>
            <input
              className="input w-full"
              placeholder="09XXXXXXXXX or +639XXXXXXXXX"
              value={form.phone}
              onChange={set("phone")}
              disabled={profileLoading}
            />
          </FormField>
          <FormField label="Address" error={profileErrors.address}>
            <input
              className="input w-full"
              placeholder="Address"
              value={form.address}
              onChange={set("address")}
              disabled={profileLoading}
            />
          </FormField>
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={handleCancel}
              disabled={profileLoading}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={profileLoading}
              className="btn-primary"
            >
              {profileLoading ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <InfoRow label="Name" value={user?.name} />
          <InfoRow label="Phone" value={user?.phone} />
          <div className="sm:col-span-2">
            <InfoRow label="Address" value={user?.address} />
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <p
        className="text-xs font-medium mb-0.5"
        style={{ color: "var(--color-muted)" }}
      >
        {label}
      </p>
      <p className="font-medium">{value || "—"}</p>
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
