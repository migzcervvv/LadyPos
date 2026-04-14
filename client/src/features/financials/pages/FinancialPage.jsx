import { useEffect, useState } from "react";
import { useFinancialApi } from "../services/financialApi";
import FinanceChart from "../components/FinanceChart";

export default function FinancialPage() {
  const { getSummary } = useFinancialApi();

  const [range, setRange] = useState("daily");
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    loadSummary();
  }, [range]);

  const loadSummary = async () => {
    const data = await getSummary(range);
    setSummary(data);
  };

  if (!summary) return <div className="p-4">Loading...</div>;

  const { total, receivables, breakdown, rangeLabel } = summary;

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold">Finance</h1>
          <p className="text-xs text-gray-500">{rangeLabel}</p>
        </div>

        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      {/* 💰 CASH POSITION */}
      <Section title="Cash Position">
        <div className="grid grid-cols-2 gap-2">
          <Stat label="Cash In" value={total.cashIn} />
          <Stat label="Expenses" value={total.expenses} />
        </div>
      </Section>

      {/* 📊 PROFIT SNAPSHOT */}
      <Section title="Profit">
        <Stat label="Net Profit" value={total.net} highlight />

        <div className="flex justify-between text-xs text-gray-500">
          <span>Revenue: ₱ {total.revenue}</span>
          <span>Expenses: ₱ {total.expenses}</span>
        </div>
      </Section>

      {/* ⚠️ RECEIVABLES */}
      <Section title="Receivables">
        <Stat label="Total Unpaid" value={receivables.total} warning />

        <div className="flex justify-between text-xs text-gray-500">
          <span>Overdue: ₱ {receivables.overdue}</span>
          <span>Not Due: ₱ {receivables.notDue}</span>
        </div>

        {/* Progress */}
        <div className="h-2 bg-gray-200 rounded overflow-hidden">
          <div
            className="h-full bg-orange-500"
            style={{
              width:
                receivables.total > 0
                  ? (receivables.overdue / receivables.total) * 100 + "%"
                  : "0%",
            }}
          />
        </div>
      </Section>

      {/* 📈 PERFORMANCE */}
      <Section title="Performance">
        <FinanceChart data={breakdown} />

        {/* OPTIONAL: keep list below chart */}
        <div className="mt-3 space-y-1">
          {breakdown.map((b, i) => (
            <div key={i} className="flex justify-between text-xs text-gray-500">
              <span>{b.label}</span>
              <span>₱ {b.net.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* 💸 DEBT FLOW (THIS IS NEW + IMPORTANT) */}
      <Section title="Debt Flow">
        <div className="flex justify-between text-sm">
          <span>Created</span>
          <span className="text-yellow-600">₱ {total.debtCreated}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span>Collected</span>
          <span className="text-green-600">₱ {total.debtCollected}</span>
        </div>
      </Section>

      {/* 📦 QUICK INSIGHT */}
      <div className="p-3 bg-black text-white rounded text-sm">
        {total.net >= 0
          ? `⚡ You're profitable: ₱${total.net}`
          : `⚠️ You're losing: ₱${Math.abs(total.net)}`}

        <br />

        {receivables.total > 0 &&
          `₱${receivables.total} still unpaid — follow up.`}
      </div>
    </div>
  );
}

// ================= COMPONENTS =================

function Section({ title, children }) {
  return (
    <div className="bg-white border rounded-xl p-3 space-y-2">
      <p className="text-sm font-semibold">{title}</p>
      {children}
    </div>
  );
}

function Stat({ label, value, highlight, warning }) {
  return (
    <div
      className={`p-2 rounded ${
        highlight ? "bg-green-100" : warning ? "bg-yellow-100" : "bg-gray-100"
      }`}
    >
      <p className="text-xs">{label}</p>
      <p className="font-bold">₱ {value.toLocaleString()}</p>
    </div>
  );
}
