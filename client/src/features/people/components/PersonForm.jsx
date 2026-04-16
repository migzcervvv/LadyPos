import { useState } from "react";

export default function PersonForm({ onSubmit }) {
  const [form, setForm] = useState({
    name: "",
    notes: "",
    contactInfo: "",
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(form);
    setForm({ name: "", notes: "", contactInfo: "" });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border p-4 space-y-4"
      style={{
        backgroundColor: "var(--color-surface)",
        borderColor: "var(--color-border)",
        color: "var(--color-text)",
      }}
    >
      {/* Name Row */}
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="text-xs" style={{ color: "var(--color-muted)" }}>
            Name
          </label>

          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="input w-full mt-1 text-sm"
          />
        </div>

        <div className="flex-1">
          <label className="text-xs" style={{ color: "var(--color-muted)" }}>
            Notes (Optional)
          </label>

          <input
            name="notes"
            value={form.notes}
            onChange={handleChange}
            className="input w-full mt-1 text-sm"
          />
        </div>
      </div>

      {/* Contact */}
      <div>
        <label className="text-xs" style={{ color: "var(--color-muted)" }}>
          Contact Info
        </label>

        <input
          name="contactInfo"
          value={form.contactInfo}
          onChange={handleChange}
          className="input w-full mt-1 text-sm"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="w-full py-2.5 rounded-xl font-medium text-white"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        Add Person
      </button>
    </form>
  );
}
