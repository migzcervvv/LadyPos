export default function OrderList({ orders }) {
  return (
    <div className="space-y-2">
      {orders.map((o) => (
        <div
          key={o._id}
          className="p-3 bg-gray-50 rounded flex justify-between"
        >
          <span>{o.paymentMethod}</span>
          <span>₱ {o.total}</span>
        </div>
      ))}
    </div>
  );
}
