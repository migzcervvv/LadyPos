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
      className="bg-white rounded-2xl shadow-sm border p-4 space-y-4"
    >
      {/* Name Row */}
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="text-xs text-gray-500">Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full mt-1 px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        <div className="flex-1">
          <label className="text-xs text-gray-500">Notes (Optional)</label>
          <input
            name="notes"
            value={form.notes}
            onChange={handleChange}
            className="w-full mt-1 px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      {/* Contact */}
      <div>
        <label className="text-xs text-gray-500">Contact Info</label>
        <input
          name="contactInfo"
          value={form.contactInfo}
          onChange={handleChange}
          className="w-full mt-1 px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2.5 rounded-xl font-medium active:scale-[0.98] transition"
      >
        Add Person
      </button>
    </form>
  );
}