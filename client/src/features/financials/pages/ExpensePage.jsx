import { useEffect, useState } from "react";
import { useExpenseApi } from "../services/expenseApi";

export default function ExpensePage() {
  const { getExpenses, createExpense, deleteExpense, updateExpense } =
    useExpenseApi();
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("misc");
  const [note, setNote] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  useEffect(() => {
    loadExpenses();
  }, []);
  const startEdit = (expense) => {
    setEditingId(expense._id);
    setAmount(expense.amount);
    setCategory(expense.category);
    setNote(expense.note || "");
    setDate(expense.date ? expense.date.substring(0, 10) : "");
  };
  const loadExpenses = async () => {
    setLoading(true);
    try {
      const data = await getExpenses();
      setExpenses(data);
    } catch (err) {
      console.error("Load expenses failed:", err);
    } finally {
      setLoading(false);
    }
  };
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!editingId) return;

    try {
      await updateExpense(editingId, {
        amount,
        category,
        note,
        date,
      });

      resetForm();
      loadExpenses();
    } catch (err) {
      console.error("Update failed:", err);
    }
  };
  const resetForm = () => {
    setAmount("");
    setCategory("misc");
    setNote("debit");
    setDate("");
    setEditingId(null);
  };
  const addExpense = async (e) => {
    e.preventDefault();

    if (!amount || amount <= 0) return;

    try {
      await createExpense({
        amount,
        category,
        note,
        date: date || undefined, // 👈 important
      });

      setAmount("");
      setDate("");
      loadExpenses();
    } catch (err) {
      console.error("Add expense failed:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteExpense(id);
      loadExpenses();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Expenses</h1>

      <div>
        <h2 className="font-semibold mb-2">Add Expense</h2>

        <form
          onSubmit={editingId ? handleUpdate : addExpense}
          className="flex gap-2 flex-wrap"
        >
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border p-2 rounded"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="inventory">Inventory</option>
            <option value="rent">Rent</option>
            <option value="utilities">Utilities</option>
            <option value="misc">Misc</option>
          </select>
          <select
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="debit">Debit</option>
            <option value="credit">Credit</option>
            <option value="cash">Cash</option>
            <option value="e-wallet">E-Wallet</option>
          </select>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border p-2 rounded"
          />
          <button className="bg-black text-white px-3 rounded">
            {editingId ? "Update" : "Add"}
          </button>{" "}
        </form>
      </div>

      <div>
        <h2 className="font-semibold mb-2">Expenses</h2>

        {loading && <p className="text-sm text-gray-400">Loading...</p>}

        {!loading && expenses.length === 0 && (
          <p className="text-sm text-gray-400">No expenses yet</p>
        )}

        <div className="space-y-2">
          {expenses.map((e) => (
            <div
              key={e._id}
              className="flex justify-between border p-2 rounded"
            >
              <div>
                <p className="font-bold">₱ {e.amount}</p>
                <p className="text-xs">{e.category}</p>
                <p className="text-xs text-gray-500">
                  {new Date(e.date).toLocaleDateString()} |{" "}
                  {e.note == "" ? "No note" : e.note.toUpperCase()}
                </p>
              </div>

              <div className="flex gap-2">
                <button onClick={() => startEdit(e)} className="text-blue-500">
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(e._id)}
                  className="text-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
