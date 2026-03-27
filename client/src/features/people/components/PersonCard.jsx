import { useState } from "react";
import DebtForm from "./DebtForm";
import { usePersonApi } from "../services/api";

export default function PersonCard({ person, refresh }) {
  const { addDebt, addPayment } = usePersonApi();
  const [showDebtForm, setShowDebtForm] = useState(false);
  const [isPayment, setIsPayment] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState(false);

  const toggleForm = (payment = false) => {
    setIsPayment(payment);
    setShowDebtForm((prev) => !prev);
  };

  const handleAdd = async (data) => {
    try {
      if (isPayment) {
        await addPayment(person._id, data);
      } else {
        await addDebt(person._id, data);
      }
      refresh();
      setShowDebtForm(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to add transaction");
    }
  };

  // Compute balance dynamically (latest transaction)
  const balance =
    person.transactions?.length > 0
      ? person.transactions[0].balanceAfter
      : 0;

  return (
    <div className="bg-white p-4 shadow rounded mb-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-bold">{person.name}</h2>
          {person.contactInfo && <p className="text-sm">{person.contactInfo}</p>}
          {person.notes && <p className="text-sm italic">{person.notes}</p>}
        </div>
        <div className="text-right">
          <p className="font-bold text-lg mb-2">
            Balance: <span className={balance < 0 ? "text-red-500" : ""}>{balance}</span>
          </p>
          <button
            className="bg-green-500 text-white px-3 py-1 rounded mr-2"
            onClick={() => toggleForm(false)}
          >
            Add Debt
          </button>
          <button
            className="bg-blue-500 text-white px-3 py-1 rounded"
            onClick={() => toggleForm(true)}
          >
            Add Payment
          </button>
        </div>
      </div>

      {showDebtForm && <DebtForm onSubmit={handleAdd} isPayment={isPayment} />}

      <div className="mt-3 border-t pt-2">
        <button
          className="w-full text-left font-semibold py-1"
          onClick={() => setAccordionOpen((prev) => !prev)}
        >
          Transactions {accordionOpen ? "▲" : "▼"}
        </button>

        {accordionOpen && (
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-sm table-auto border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-2 py-1 border">Type</th>
                  <th className="px-2 py-1 border">Amount</th>
                  <th className="px-2 py-1 border">Date</th>
                  <th className="px-2 py-1 border">Balance</th>
                  <th className="px-2 py-1 border">Order</th>
                  <th className="px-2 py-1 border">Notes</th>
                </tr>
              </thead>
              <tbody>
                {person.transactions?.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-2 py-1 border">{t.type}</td>
                    <td className="px-2 py-1 border">{t.amount}</td>
                    <td className="px-2 py-1 border">
                      {new Date(t.date).toLocaleDateString()}
                    </td>
                    <td className="px-2 py-1 border">{t.balanceAfter}</td>
                    <td className="px-2 py-1 border">
                      {t.orderId || "-"}
                    </td>
                    <td className="px-2 py-1 border">{t.notes || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}