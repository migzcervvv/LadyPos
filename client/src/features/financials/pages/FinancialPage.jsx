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
    <div
      className="p-4 max-w-md mx-auto space-y-4"
      style={{
        backgroundColor: "var(--color-bg)",
        color: "var(--color-text)",
        minHeight: "100vh",
      }}
    >
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold">Finance</h1>
          <p style={{ color: "var(--color-muted)" }}>{rangeLabel}</p>
        </div>

        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="input text-sm"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      <Section title="Cash Position">
        <div className="grid grid-cols-2 gap-2">
          <Stat label="Cash In" value={total.cashIn} />
          <Stat label="Expenses" value={total.expenses} />
        </div>
      </Section>

      <Section title="Profit">
        <Stat label="Net Profit" value={total.net} highlight />

        <div className="flex justify-between text-xs">
          <span>Revenue: ₱ {total.revenue}</span>
          <span>Expenses: ₱ {total.expenses}</span>
        </div>
      </Section>

      <Section title="Receivables">
        <Stat label="Total Unpaid" value={receivables.total} warning />

        <div className="flex justify-between text-xs">
          <span>Overdue: ₱ {receivables.overdue}</span>
          <span>Not Due: ₱ {receivables.notDue}</span>
        </div>

        <div
          className="h-2 rounded overflow-hidden"
          style={{ backgroundColor: "var(--color-border)" }}
        >
          <div
            className="h-full"
            style={{
              backgroundColor: "var(--color-accent)",
              width:
                receivables.total > 0
                  ? (receivables.overdue / receivables.total) * 100 + "%"
                  : "0%",
            }}
          />
        </div>
      </Section>

      <Section title="Performance">
        <FinanceChart data={breakdown} />

        <div className="mt-3 space-y-1">
          {breakdown.map((b, i) => (
            <div
              key={i}
              className="flex justify-between text-xs"
              style={{ color: "var(--color-muted)" }}
            >
              <span>{b.label}</span>
              <span>₱ {b.net.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Debt Flow">
        <div className="flex justify-between text-sm">
          <span>Created</span>
          <span style={{ color: "#f59e0b" }}>₱ {total.debtCreated}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span>Collected</span>
          <span style={{ color: "#22c55e" }}>₱ {total.debtCollected}</span>
        </div>
      </Section>

      <div
        className="p-3 rounded text-sm"
        style={{
          backgroundColor: "var(--color-primary)",
          color: "white",
        }}
      >
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
    <div
      className="border rounded-xl p-3 space-y-2"
      style={{
        backgroundColor: "var(--color-surface)",
        borderColor: "var(--color-border)",
      }}
    >
      <p className="text-sm font-semibold">{title}</p>
      {children}
    </div>
  );
}

function Stat({ label, value, highlight, warning }) {
  let bg = "var(--color-bg)";

  if (highlight) bg = "rgba(34,197,94,0.15)";
  if (warning) bg = "rgba(245,158,11,0.15)";

  return (
    <div
      className="p-2 rounded"
      style={{
        backgroundColor: bg,
        border: `1px solid var(--color-border)`,
      }}
    >
      <p className="text-xs" style={{ color: "var(--color-muted)" }}>
        {label}
      </p>
      <p className="font-bold">₱ {value.toLocaleString()}</p>
    </div>
  );
}
