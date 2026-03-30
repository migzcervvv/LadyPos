import { useEffect, useState } from "react";
import { useFinancialApi } from "../services/financialApi";
import KpiCard from "../components/KpiCard.jsx";
import FlowRow from "../components/FlowRow.jsx";
import BottomSheet from "../components/BottomSheet.jsx";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function FinancialDashboard() {
  const { getDashboard } = useFinancialApi();
  const [selectedView, setSelectedView] = useState(null);
  // { type: "revenue" | "debtor" | "day", data: any }
  const [data, setData] = useState(null);
  const [days, setDays] = useState(7);

  useEffect(() => {
    load();
  }, [days]);

  const load = async () => {
    try {
      const res = await getDashboard(days); // 👈 pass filter
      setData(res);
    } catch (err) {
      console.error(err);
    }
  };

  if (!data) return <div className="p-6">Loading...</div>;

  const { kpis, topDebtors, daily } = data;

  return (
    <>
      <div className="p-4 md:p-6 space-y-6 bg-gray-50 min-h-screen">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Financial Dashboard</h1>
            <p className="text-sm text-gray-500">
              Understand your business performance
            </p>
          </div>

          {/* 🔥 FILTER */}
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="border rounded px-3 py-1"
          >
            <option value={1}>Today</option>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
          </select>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard
            title="Revenue"
            value={kpis.revenue}
            color="blue"
            onClick={() =>
              setSelectedView({
                type: "revenue",
                data: data.orders, // 👈 backend should include this
              })
            }
          />
          <KpiCard title="Cash In" value={kpis.cashIn} color="green" />
          <KpiCard
            title="Receivables"
            value={kpis.receivables}
            color="yellow"
          />
          <KpiCard title="Net Profit" value={kpis.netProfit} color="purple" />
        </div>

        {/* CHART */}
        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="font-semibold mb-3">Revenue Trend</h2>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={daily}
              onClick={(e) => {
                if (!e?.activePayload) return;

                const day = e.activePayload[0].payload.date;

                setSelectedView({
                  type: "day",
                  data: day,
                });
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />

              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={2}
              />

              <Line
                type="monotone"
                dataKey="receivables"
                stroke="#f59e0b"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/* LOWER GRID */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* CASH FLOW (FIXED UX) */}
          <div className="bg-white p-5 rounded-xl shadow">
            <h2 className="font-semibold mb-3">Cash Flow</h2>

            <div className="text-xs text-gray-500 mb-3">
              Cash In = Paid Orders + Customer Payments
              <br />
              Cash Out = Expenses
            </div>

            <FlowRow
              label="Cash In"
              value={kpis.cashIn}
              color="text-green-600"
            />
            <FlowRow
              label="Cash Out"
              value={kpis.cashOut}
              color="text-red-500"
            />

            <div className="border-t my-3"></div>

            <FlowRow
              label="Net Cash"
              value={kpis.netCashFlow}
              color={kpis.netCashFlow >= 0 ? "text-green-600" : "text-red-500"}
              bold
            />
          </div>

          {/* TOP DEBTORS (FIXED SIZE) */}
          <div className="bg-white p-5 rounded-xl shadow">
            <h2 className="font-semibold mb-3">Top Debtors</h2>

            <div className="space-y-2">
              {topDebtors.map((d, i) => (
                <div
                  key={i}
                  onClick={() =>
                    setSelectedView({
                      type: "debtor",
                      data: d,
                    })
                  }
                  className="flex justify-between text-sm bg-gray-50 p-2 rounded"
                >
                  <span>{d.name}</span>
                  <span className="text-red-500">₱ {d.balance}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <BottomSheet view={selectedView} onClose={() => setSelectedView(null)} />
    </>
  );
}
