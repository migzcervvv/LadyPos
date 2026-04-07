// services/personService.js
import Person from "../models/Person.js";

export async function addTransactionToPerson({
  personId,
  kind,
  context,
  amount,
  orderId,
  paymentMethod,
  notes,
  session,
}) {
  const update = {
    $push: {
      debts: {
        kind,
        context,
        amount,
        orderId,
        paymentMethod,
        notes,
        date: new Date(),
      },
    },
  };

  return Person.findByIdAndUpdate(personId, update, { session });
}
