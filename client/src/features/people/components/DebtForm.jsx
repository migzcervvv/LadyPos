import { useState } from "react";

export default function DebtForm({ onSubmit, isPayment }) {
  const [form, setForm] = useState({ amount: "", notes: "" });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, amount: parseFloat(form.amount) });
    setForm({ amount: "", notes: "" });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-100 p-2 rounded mt-2 space-y-2"
    >
      <input
        name="amount"
        type="number"
        step="0.01"
        placeholder={isPayment ? "Payment Amount" : "Debt Amount"}
        value={form.amount}
        onChange={handleChange}
        required
        className="border p-2 rounded w-full"
      />
      <input
        name="notes"
        placeholder="Notes"
        value={form.notes}
        onChange={handleChange}
        className="border p-2 rounded w-full"
      />
      <button
        type="submit"
        className={`w-full py-1 rounded ${
          isPayment ? "bg-blue-500 text-white" : "bg-green-500 text-white"
        }`}
      >
        {isPayment ? "Add Payment" : "Add Debt"}
      </button>
    </form>
  );
}