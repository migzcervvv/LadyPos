import { useState } from "react";

export default function DebtForm({ onSubmit, isPayment }) {
  const [form, setForm] = useState({ amount: "", notes: "" });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ ...form, amount: parseFloat(form.amount) });
        setForm({ amount: "", notes: "" });
      }}
      className="bg-gray-50 border rounded-xl p-3 space-y-2"
    >
      <input
        name="amount"
        type="number"
        placeholder={isPayment ? "Enter payment amount" : "Enter debt amount"}
        value={form.amount}
        onChange={handleChange}
        required
        className="w-full px-3 py-2 rounded-lg border text-sm"
      />

      <input
        name="notes"
        placeholder="Optional note (e.g. paid cash)"
        value={form.notes}
        onChange={handleChange}
        className="w-full px-3 py-2 rounded-lg border text-sm"
      />

      <button
        className={`w-full py-2 rounded-xl text-white text-sm ${
          isPayment ? "bg-blue-500" : "bg-green-500"
        }`}
      >
        {isPayment ? "Confirm Payment" : "Add Debt"}
      </button>
    </form>
  );
}
