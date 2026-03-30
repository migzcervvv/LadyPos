import { useEffect, useState } from "react";
import { useFinancialApi } from "../services/financialApi";

export default function DayDetails({ date }) {
  const { getDayDetails } = useFinancialApi();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    load();
  }, [date]);

  const load = async () => {
    try {
      const res = await getDayDetails(date);
      setOrders(res);
    } catch (err) {
      console.error(err);
    }
  };

  const total = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div>
        <h2 className="font-bold text-lg">{date}</h2>
        <p className="text-sm text-gray-500">
          {orders.length} orders • ₱ {total}
        </p>
      </div>

      {/* LIST */}
      <div className="space-y-2">
        {orders.map((o) => (
          <div
            key={o._id}
            className="p-3 bg-gray-50 rounded flex justify-between items-center"
          >
            <div>
              <p className="text-sm font-medium">
                {o.personId?.name || "Walk-in"}
              </p>
              <p className="text-xs text-gray-500">
                {o.paymentMethod} • {o.paymentStatus}
              </p>
            </div>

            <div className="text-right">
              <p className="font-semibold">₱ {o.total}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
