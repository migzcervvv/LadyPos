import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
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
          <Tooltip />

          <Line type="monotone" dataKey="gross" stroke="#16a34a" />
          <Line type="monotone" dataKey="expenses" stroke="#dc2626" />
          <Line type="monotone" dataKey="net" stroke="#2563eb" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
