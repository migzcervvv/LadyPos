export default function FlowRow({ label, value, color, bold }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={`${color} ${bold ? "font-bold" : ""}`}>₱ {value}</span>
    </div>
  );
}
