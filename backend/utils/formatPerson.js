// utils/formatPerson.js

export function formatPerson(person) {
  let running = 0;

  const sorted = [...person.debts].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  const transactions = sorted.map((d) => {
    running += d.type === "debt"
      ? d.amount
      : -d.amount;

    return {
      id: d._id,
      type: d.type,
      amount: d.amount,
      balanceAfter: running,
      date: d.date,
      notes: d.notes,
      paymentMethod: d.paymentMethod,
    };
  }).reverse();

  return {
    _id: person._id,
    name: person.name,
    contactInfo: person.contactInfo,
    notes: person.notes,
    balance: running,
    transactions,
    createdAt: person.createdAt
  };
}