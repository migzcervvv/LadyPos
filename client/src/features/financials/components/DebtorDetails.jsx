export default function DebtorDetails({ debtor }) {
  return (
    <div>
      <h3 className="font-semibold">{debtor.name}</h3>
      <p className="text-red-500 mb-3">₱ {debtor.balance}</p>

      {/* Later: show full ledger */}
      <p className="text-sm text-gray-500">
        Full transaction history coming soon
      </p>
    </div>
  );
}
