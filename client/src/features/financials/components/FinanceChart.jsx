import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function FinanceChart({ data, onClick }) {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer>
        <LineChart
          data={data}
          onClick={(e) => {
            if (e && e.activePayload && onClick) {
              const item = e.activePayload[0]?.payload;
              onClick(item);
            }
          }}
        >
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip formatter={(value) => `₱ ${value.toLocaleString()}`} />{" "}
          <Legend />
          {/* ✅ CORE BUSINESS METRICS */}
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#16a34a"
            name="Revenue"
          />
          <Line
            type="monotone"
            dataKey="expenses"
            stroke="#dc2626"
            name="Expenses"
          />
          <Line
            type="monotone"
            dataKey="net"
            stroke="#2563eb"
            name="Net Profit"
          />
          {/* 🔥 OPTIONAL: CASH FLOW */}
          <Line
            type="monotone"
            dataKey="cashIn"
            stroke="#f59e0b"
            name="Cash In"
            strokeDasharray="4 4"
          />
          {/* 🔥 OPTIONAL: DEBT INSIGHT */}
          <Line
            type="monotone"
            dataKey="debtCreated"
            stroke="#eab308"
            name="Debt Created"
            strokeDasharray="2 2"
          />
          <Line
            type="monotone"
            dataKey="debtCollected"
            stroke="#22c55e"
            name="Debt Collected"
            strokeDasharray="2 2"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
