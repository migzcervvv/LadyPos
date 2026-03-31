import { useEffect, useState } from "react";
import FinanceChart from "../components/FinanceChart";
import { useFinancialApi } from "../services/financialApi";
import { useAuth } from "../../../shared/hooks/AuthContext";
import axios from "axios";

export default function FinancialPage() {
  const { getSummary, getDayDetails } = useFinancialApi();
  const { jwt } = useAuth();

  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: { Authorization: `Bearer ${jwt}` },
  });

  const [range, setRange] = useState("daily");
  const [summary, setSummary] = useState(null);

  const [selected, setSelected] = useState(null);
  const [orders, setOrders] = useState([]);

  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    loadSummary();
    loadExpenses();
  }, [range]);

  const loadSummary = async () => {
    const data = await getSummary(range);
    setSummary(data);
    setSelected(null);
  };

  const loadExpenses = async () => {
    const res = await api.get("/expenses");
    setExpenses(res.data);
  };

  const handleSelect = async (item) => {
    if (range !== "daily") return;

    setSelected(item);

    const res = await getDayDetails(item.raw);
    setOrders(res);
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Finance Dashboard</h1>

      {/* RANGE */}
      <div className="flex gap-2">
        {["daily", "weekly", "monthly"].map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`px-3 py-1 rounded ${
              range === r ? "bg-black text-white" : "border"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* KPI */}
      {summary && (
        <>
          <p className="text-xs text-gray-500">{summary.rangeLabel}</p>
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 bg-green-100 rounded">
              ₱ {summary.total.gross.toFixed(2)}
            </div>

            <div className="p-3 bg-red-100 rounded">
              ₱ {summary.total.expenses.toFixed(2)}
            </div>

            <div className="p-3 bg-blue-100 rounded">
              ₱ {summary.total.net.toFixed(2)}
            </div>
          </div>
        </>
      )}

      {/* CHART */}
      {summary && (
        <FinanceChart data={summary.breakdown} onClick={handleSelect} />
      )}

      {/* MASTER DETAIL */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* LEFT */}
        <div className="space-y-2">
          {summary?.breakdown.map((b, i) => (
            <div
              key={i}
              onClick={() => handleSelect(b)}
              className={`p-3 border rounded cursor-pointer ${
                selected?.raw === b.raw ? "bg-black text-white" : ""
              }`}
            >
              <div className="flex justify-between">
                <span>{b.label}</span>
                <span>₱ {b.net.toFixed(2)}</span>
              </div>

              <p className="text-xs text-gray-500">
                G: {b.gross} | E: {b.expenses}
              </p>
            </div>
          ))}
        </div>

        {/* RIGHT */}
        <div>
          {!selected && <p>Select a day</p>}

          {selected && range === "daily" && (
            <div className="space-y-2">
              {orders.map((o) => (
                <div
                  key={o._id}
                  className="border p-3 rounded flex justify-between"
                >
                  <span>{o.personId?.name || "Walk-in"}</span>
                  <span>₱ {o.total}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
