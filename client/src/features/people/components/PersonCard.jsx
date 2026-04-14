import { usePersonApi } from "../services/api";
import { useState } from "react";
import DebtForm from "../components/DebtForm";

export default function PersonCard({ person, refresh }) {
  const [showDebtForm, setShowDebtForm] = useState(false);
  const [isPayment, setIsPayment] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addDebt, addPayment, updatePerson, deletePerson } = usePersonApi();

  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    name: person.name,
    contactInfo: person.contactInfo || "",
    notes: person.notes || "",
  });
  // ✅ Safe balance calc
  const balance =
    person.debts?.reduce((acc, t) => {
      if (t.kind === "charge") return acc + t.amount;
      if (t.kind === "payment" && t.context === "debt") return acc - t.amount;
      return acc;
    }, 0) ?? 0;

  // ✅ Add handler with real debugging
  const handleAdd = async (data) => {
    try {
      setLoading(true);

      const payload = {
        amount: data.amount,
        notes: data.notes,
      };

      console.log("ADDING: ", payload, isPayment ? "PAYMENT" : "DEBT");

      if (isPayment) {
        await addPayment(person._id, payload);
      } else {
        await addDebt(person._id, payload);
      }

      if (refresh) {
        await refresh();
      }

      setShowDebtForm(false);
    } catch (err) {
      console.error("ADD FAILED:", err);
      alert("Failed to save transaction");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await updatePerson(person._id, editForm);
      await refresh();
      setShowEdit(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this person? This cannot be undone.")) return;

    try {
      await deletePerson(person._id);
      await refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to delete");
    }
  };

  // ✅ Robust sorting (handles missing/bad dates)
  const sortedTransactions = person.debts?.slice().sort((a, b) => {
    const dateA = new Date(a.date || a.createdAt || 0).getTime();
    const dateB = new Date(b.date || b.createdAt || 0).getTime();
    return dateB - dateA;
  });

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
            setShowDebtForm((prev) => !prev);
          }}
          className="flex-1 md:w-40 bg-green-500 text-white py-2 rounded-xl text-sm active:scale-95"
        >
          + Debt
        </button>

        <button
          onClick={() => {
            setIsPayment(true);
            setShowDebtForm((prev) => !prev);
          }}
          className="flex-1 md:w-40 bg-blue-500 text-white py-2 rounded-xl text-sm active:scale-95"
        >
          + Payment
        </button>
      </div>

      {/* FORM */}
      {showDebtForm && <DebtForm onSubmit={handleAdd} isPayment={isPayment} />}
      <div className="flex justify-start pt-2">
        <button
          onClick={() => setShowEdit(true)}
          className="bg-gray-800 text-white text-xs px-3 py-1.5 rounded-lg active:scale-95"
        >
          ⚙ Manage
        </button>
      </div>
      {/* TRANSACTIONS */}
      <div className="pt-2">
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="w-full text-left text-sm font-medium text-gray-600"
        >
          Transactions {open ? "▲" : "▼"}
        </button>

        {open && (
          <div className="mt-2 p-2 rounded-2xl bg-gray-50 border space-y-2 max-h-64 overflow-y-auto">
            {sortedTransactions?.length ? (
              sortedTransactions.map((t) => {
                const isDebt = t.kind === "charge";

                return (
                  <div
                    key={t._id || t.id} // 🔥 fix potential key issue
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
                        {new Date(
                          t.date || t.createdAt || Date.now(),
                        ).toLocaleString("en-US", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </p>

                      {t.notes && (
                        <p className="text-xs italic text-gray-500">
                          {t.notes}
                        </p>
                      )}
                    </div>

                    {/* RIGHT */}
                    <div className="text-right text-xs">
                      <p className="text-gray-400">Amount</p>
                      <p className="font-semibold text-gray-700">₱{t.amount}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-gray-400 text-center">
                No transactions yet
              </p>
            )}
          </div>
        )}
      </div>
      {showEdit && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-4 w-[90%] max-w-sm space-y-3">
            <h3 className="font-semibold text-sm">Manage Person</h3>

            <input
              className="w-full border px-2 py-1 rounded text-sm"
              value={editForm.name}
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.target.value })
              }
              placeholder="Name"
            />

            <input
              className="w-full border px-2 py-1 rounded text-sm"
              value={editForm.contactInfo}
              onChange={(e) =>
                setEditForm({ ...editForm, contactInfo: e.target.value })
              }
              placeholder="Contact"
            />

            <input
              className="w-full border px-2 py-1 rounded text-sm"
              value={editForm.notes}
              onChange={(e) =>
                setEditForm({ ...editForm, notes: e.target.value })
              }
              placeholder="Notes"
            />

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleUpdate}
                className="flex-1 bg-blue-500 text-white py-1.5 rounded text-sm"
              >
                Save
              </button>

              <button
                onClick={handleDelete}
                className="flex-1 bg-red-500 text-white py-1.5 rounded text-sm"
              >
                Delete
              </button>
            </div>

            <button
              onClick={() => setShowEdit(false)}
              className="w-full text-xs text-gray-500 pt-1"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
