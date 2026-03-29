import { useEffect, useState } from "react";
import { useFinancialApi } from "../services/financialApi";

export default function FinancialPage() {
  const { getDashboard } = useFinancialApi();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    try {
      const res = await getDashboard();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="p-4 text-gray-500">Loading financials...</div>;
  }

  if (!data) {
    return <div className="p-4 text-red-500">Failed to load data</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Financial Dashboard</h1>

      {/* Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card title="Gross Income" value={data.grossIncome} color="green" />
        <Card title="Expenses" value={data.totalExpenses} color="red" />
        <Card title="Net Income" value={data.netIncome} color="blue" />
        <Card title="Debt" value={data.totalDebt} color="yellow" />
        <Card title="ROI %" value={data.roi?.toFixed(2)} color="purple" />
        <Card title="Orders" value={data.totalOrders} color="gray" />
      </div>

      {/* Simple Insight */}
      <div className="bg-white rounded-xl shadow p-4">
        <p className="text-sm text-gray-600">
          {data.netIncome >= 0
            ? "You're profitable. Keep going."
            : "You're losing money. Check expenses."}
        </p>
      </div>
    </div>
  );
}

function Card({ title, value, color }) {
  const colorMap = {
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    blue: "bg-blue-100 text-blue-700",
    yellow: "bg-yellow-100 text-yellow-700",
    purple: "bg-purple-100 text-purple-700",
    gray: "bg-gray-100 text-gray-700",
  };

  return (
    <div className={`rounded-xl p-4 shadow ${colorMap[color]}`}>
      <p className="text-xs opacity-70">{title}</p>
      <p className="text-lg font-bold">
        ₱ {Number(value || 0).toLocaleString()}
      </p>
    </div>
  );
}
