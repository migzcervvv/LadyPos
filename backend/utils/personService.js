// services/personService.js
import Person from '../models/Person.js';

export async function addDebtToPerson({
  personId,
  userId,
  amount,
  orderId,
  notes,
  paymentMethod
}) {
  const person = await Person.findOne({ _id: personId, userId });

  if (!person) throw new Error("Person not found");

  person.debts.push({
    type: "debt",
    amount,
    orderId,
    notes,
    paymentMethod: paymentMethod || "Cash",
  });

  await person.save();
  return person;
}

export async function addPaymentToPerson({
  personId,
  userId,
  amount,
  notes,
  paymentMethod
}) {
  const person = await Person.findOne({ _id: personId, userId });

  if (!person) throw new Error("Person not found");

  const balance = person.debts.reduce((acc, d) => {
    return d.type === "debt" ? acc + d.amount : acc - d.amount;
  }, 0);

  if (amount > balance) {
    throw new Error("Payment exceeds remaining debt");
  }

  person.debts.push({
    type: "payment",
    amount,
    notes,
    paymentMethod: paymentMethod || "Cash",
  });

  await person.save();
  return person;
}