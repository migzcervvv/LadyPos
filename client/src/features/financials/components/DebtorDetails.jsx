import { useEffect, useState } from "react";
import { usePersonApi } from "../../people/services/api.js";

export default function DebtorDetails({ data }) {
  const [debtor, setDebtor] = useState(null);
  const { getPersonById } = usePersonApi();

  useEffect(() => {
    if (!data?.id) return;

    const fetchPerson = async () => {
      try {
        const res = await getPersonById(data.id);
        setDebtor(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchPerson();
  }, [data]);

  if (!debtor) return <div>Loading...</div>;

  return (
    <div>
      <h3 className="font-semibold">{debtor.name}</h3>
      <p className="text-red-500 mb-3">₱ {debtor.balance}</p>

      {/* Example: debts list */}
      <div className="mt-4 space-y-2">
        {debtor.transactions?.length > 0 ? (
          debtor.transactions.map((d) => (
            <div key={d.id} className="p-2 border rounded">
              <p className="text-sm">₱ {d.amount}</p>
              <p className="text-xs text-gray-500">
                {new Date(d.date).toLocaleString("en-US", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">No debts found</p>
        )}
      </div>
    </div>
  );
}
