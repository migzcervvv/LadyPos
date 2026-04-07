import { usePersonApi } from "../services/api";
import { useState } from "react";
import DebtForm from "../components/DebtForm";

export default function PersonCard({ person, refresh }) {
  const { addTransaction } = usePersonApi();
  const [showDebtForm, setShowDebtForm] = useState(false);
  const [isPayment, setIsPayment] = useState(false);
  const [open, setOpen] = useState(false);

  const balance = person.debts?.reduce((acc, t) => {
    if (t.kind === "charge") return acc + t.amount;
    if (t.kind === "payment" && t.context === "debt") return acc - t.amount;
    return acc;
  }, 0);

  const handleAdd = async (data) => {
    const payload = {
      amount: data.amount,
      notes: data.notes,
      kind: isPayment ? "payment" : "charge",
      context: "debt", // 🔥 manual entries always affect debt
    };

    await addTransaction(person._id, payload);

    refresh();
    setShowDebtForm(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-4 space-y-3">
      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="font-semibold text-base">{person.name}</h2>

          {person.contactInfo && (
            <p className="text-xs text-gray-500">{person.contactInfo}</p>
          )}

          {person.notes && (
            <p className="text-xs italic text-gray-400">{person.notes}</p>
          )}
        </div>

        <div className="text-right">
          <p className="text-xs text-gray-400">Balance</p>
          <p
            className={`text-lg font-bold ${
              balance < 0 ? "text-red-500" : "text-green-600"
            }`}
          >
            ₱ {balance}
          </p>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-2">
        <button
          onClick={() => {
            setIsPayment(false);
            setShowDebtForm(!showDebtForm);
          }}
          className="flex-1 md:w-40 bg-green-500 text-white py-2 rounded-xl text-sm active:scale-95"
        >
          + Debt
        </button>

        <button
          onClick={() => {
            setIsPayment(true);
            setShowDebtForm(!showDebtForm);
          }}
          className="flex-1 md:w-40 bg-blue-500 text-white py-2 rounded-xl text-sm active:scale-95"
        >
          + Payment
        </button>
      </div>

      {/* FORM */}
      {showDebtForm && <DebtForm onSubmit={handleAdd} isPayment={isPayment} />}

      {/* TRANSACTIONS */}
      {/* TRANSACTIONS */}
      <div className="pt-2">
        <button
          onClick={() => setOpen(!open)}
          className="w-full text-left text-sm font-medium text-gray-600"
        >
          Transactions {open ? "▲" : "▼"}
        </button>

        {open && (
          <div className="mt-2 p-2 rounded-2xl bg-gray-50 border space-y-2 max-h-64 overflow-y-auto">
            {person.transactions?.map((t) => {
              const isDebt = t.kind === "charge";
              return (
                <div
                  key={t.id}
                  className={`p-3 rounded-xl text-sm flex justify-between border
              ${
                isDebt
                  ? "bg-red-50 border-red-100"
                  : "bg-green-50 border-green-100"
              }`}
                >
                  {/* LEFT */}
                  <div>
                    <p className="font-medium text-gray-800">
                      {t.kind} • {t.context}
                    </p>

                    <p className="text-xs text-gray-500">
                      {new Date(t.date).toLocaleString("en-US", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </p>

                    {t.notes && (
                      <p className="text-xs italic text-gray-500">{t.notes}</p>
                    )}
                  </div>

                  {/* RIGHT */}
                  <div className="text-right text-xs">
                    <p className="text-gray-400">Balance</p>
                    <p className="font-semibold text-gray-700">₱{t.amount}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
