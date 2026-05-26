import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useFinancialApi } from "../services/financialApi";

const formatMoney = (centavos = 0) =>
  `PHP ${(Number(centavos) / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function FinancialPage() {
  const { getSummary, getRevenueByRange } = useFinancialApi();
  const [summary, setSummary] = useState(null);
  const [range, setRange] = useState("daily");
  const [revenue, setRevenue] = useState([]);

  useEffect(() => {
    getSummary().then(setSummary);
  }, []);

  useEffect(() => {
    getRevenueByRange(range).then(setRevenue);
  }, [range]);

  if (!summary) return <div className="screen-wrap">Loading...</div>;

  return (
    <div className="screen-wrap">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <div className="tab-row compact">
          {["daily", "weekly", "monthly"].map((item) => (
            <button key={item} className={range === item ? "selected" : ""} onClick={() => setRange(item)}>
              {item}
            </button>
          ))}
        </div>
      </div>

      <section className="kpi-grid">
        <Kpi label="Total Revenue" value={formatMoney(summary.totalRevenue)} />
        <Kpi label="Outstanding Debt" value={formatMoney(summary.totalOutstandingDebt)} tone="danger" />
        <Kpi label="Total Orders" value={summary.totalOrders} />
        <Kpi label="Total Customers" value={summary.totalCustomers} />
      </section>

      <section className="dashboard-panel">
        <h2 className="mb-3 text-base font-semibold">Revenue</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenue}>
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(value) => `${value / 100}`} tick={{ fontSize: 11 }} width={38} />
              <Tooltip formatter={(value) => formatMoney(value)} />
              <Bar dataKey="revenue" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="dashboard-panel">
        <h2 className="mb-3 text-base font-semibold">Recent Transactions</h2>
        <div className="space-y-2">
          {summary.recentTransactions.map((transaction) => (
            <div key={transaction._id} className="payment-row">
              <span>
                <strong>{transaction.customer?.name || "Customer"}</strong>
                <small>{new Date(transaction.createdAt).toLocaleDateString()}</small>
              </span>
              <span>{formatMoney(transaction.amountPaid)}</span>
              <span className={`status-chip ${transaction.paymentStatus}`}>{transaction.paymentStatus}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Kpi({ label, value, tone }) {
  return (
    <div className={`kpi-card ${tone || ""}`}>
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  );
}
