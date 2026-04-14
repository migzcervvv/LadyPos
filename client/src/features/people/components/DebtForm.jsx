import { useState } from "react";

export default function DebtForm({ onSubmit, isPayment }) {
  const [form, setForm] = useState({ amount: "", notes: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const amount = parseFloat(form.amount);

    // 🔴 HARD GUARDS (you were missing this)
    if (!amount || isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    try {
      setLoading(true);

      await onSubmit({
        amount,
        notes: form.notes?.trim(),
      });

      // ✅ Reset after success
      setForm({ amount: "", notes: "" });
    } catch (err) {
      console.error("Submit failed:", err);
      alert("Something went wrong while saving");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-50 border rounded-xl p-3 space-y-2"
    >
      <input
        name="amount"
        type="number"
        step="0.01"
        min="0"
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
        type="submit"
        disabled={loading}
        className={`w-full py-2 rounded-xl text-white text-sm transition ${
          isPayment ? "bg-blue-500" : "bg-green-500"
        } ${loading ? "opacity-60 cursor-not-allowed" : "active:scale-95"}`}
      >
        {loading ? "Saving..." : isPayment ? "Confirm Payment" : "Add Debt"}
      </button>
    </form>
  );
}
