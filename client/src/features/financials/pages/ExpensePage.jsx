import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../shared/hooks/AuthContext";

export default function ExpensePage() {
  const { jwt } = useAuth();

  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: { Authorization: `Bearer ${jwt}` },
  });

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("misc");
  const [note, setNote] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ LOAD ONCE
  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const res = await api.get("/expenses");
      setExpenses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 ADD
  const addExpense = async (e) => {
    e.preventDefault();

    if (!amount || amount <= 0) return;

    try {
      await api.post("/expenses", {
        amount,
        category,
        note,
      });

      setAmount("");
      setNote("");

      loadExpenses();
    } catch (err) {
      console.error(err);
    }
  };

  // 🔥 DELETE
  const deleteExpense = async (id) => {
    try {
      await api.delete(`/expenses/${id}`);
      loadExpenses();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Expenses</h1>

      {/* 🔥 ADD EXPENSE */}
      <div>
        <h2 className="font-semibold mb-2">Add Expense</h2>

        <form onSubmit={addExpense} className="flex gap-2 flex-wrap">
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

          <input
            type="text"
            placeholder="Note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="border p-2 rounded"
          />

          <button className="bg-black text-white px-3 rounded">Add</button>
        </form>
      </div>

      {/* 🔥 LIST */}
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
                <p className="text-xs text-gray-500">{e.note}</p>
              </div>

              <button
                onClick={() => deleteExpense(e._id)}
                className="text-red-500"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
