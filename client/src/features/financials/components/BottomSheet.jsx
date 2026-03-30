import DebtorDetails from "./DebtorDetails.jsx";
import DayDetails from "./DayDetails.jsx";

export default function BottomSheet({ view, onClose }) {
  if (!view) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* BACKDROP */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* SHEET */}
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4 max-h-[85vh] overflow-y-auto animate-slideUp">
        {/* HANDLE */}
        <div className="w-10 h-1.5 bg-gray-300 rounded mx-auto mb-3"></div>

        {/* HEADER */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold capitalize">{view.type}</h2>
          <button onClick={onClose} className="text-sm text-gray-500">
            Close
          </button>
        </div>

        {/* CONTENT */}
        {view.type === "test" && (
          <div className="text-center text-gray-500">
            BottomSheet is working 🎉
          </div>
        )}

        {view.type === "day" && <DayDetails date={view.data} />}

        {view.type === "debtor" && <DebtorDetails id={view.data.id} />}
      </div>
    </div>
  );
}
