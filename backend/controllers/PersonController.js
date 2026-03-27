import Person from '../models/Person.js';
import { formatPerson } from "../utils/formatPerson.js";

//
// CREATE PERSON
//
export async function createPerson(req, res, next) {
  console.log("REQ.USER:", req.body); // <-- add this
  try {
    const person = await Person.create({
      ...req.body,
      userId: req.user.id,
    });

    res.status(201).json(formatPerson(person));
  } catch (err) {
    console.error("CREATE PERSON ERROR:", err);
    next(err);
  }
}

//
// GET ALL PEOPLE (for current user)
//
export async function getPeople(req, res, next) {
  try {
    const people = await Person.find({ userId: req.user.id }).sort({ name: 1 });
    const formatted = people.map(formatPerson);
    res.json(formatted);
  } catch (err) {
    next(err);
  }
}

//
// GET ONE PERSON
//
export async function getPersonById(req, res, next) {
  try {
    const person = await Person.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!person) {
      res.status(404);
      throw new Error("Person not found");
    }

    res.json(formatPerson(person));
  } catch (err) {
    next(err);
  }
}

//
// UPDATE PERSON
//
export async function updatePerson(req, res, next) {
  try {
    const { name, contactInfo, notes } = req.body;

    const person = await Person.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { name, contactInfo, notes },
      { new: true }
    );

    if (!person) {
      res.status(404);
      throw new Error("Person not found");
    }

    res.json(formatPerson(person));
  } catch (err) {
    next(err);
  }
}

//
// DELETE PERSON
//
export async function deletePerson(req, res, next) {
  try {
    const person = await Person.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!person) {
      res.status(404);
      throw new Error("Person not found");
    }

    res.json({ message: "Person deleted" });
  } catch (err) {
    next(err);
  }
}

//
// ADD DEBT
//
export async function addDebt(req, res, next) {
  try {
    const { amount, orderId, notes, paymentMethod } = req.body;

    if (!amount || amount <= 0) {
      res.status(400);
      throw new Error("Amount must be greater than 0");
    }

    const person = await Person.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!person) {
      res.status(404);
      throw new Error("Person not found");
    }

    person.debts.push({
      type: "debt",
      amount,
      orderId,
      notes,
      paymentMethod: paymentMethod || "Cash",
    });

    await person.save();
    res.status(201).json(formatPerson(person));
  } catch (err) {
    next(err);
  }
}

//
// ADD PAYMENT
//
export async function addPayment(req, res, next) {
  try {
    const { amount, notes, paymentMethod } = req.body;

    if (!amount || amount <= 0) {
      res.status(400);
      throw new Error("Amount must be greater than 0");
    }

    const person = await Person.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!person) {
      res.status(404);
      throw new Error("Person not found");
    }

    // Compute current balance
    const balance = person.debts.reduce((acc, d) => {
      return d.type === "debt" ? acc + d.amount : acc - d.amount;
    }, 0);

    if (amount > balance) {
      res.status(400);
      throw new Error("Payment exceeds remaining debt");
    }

    person.debts.push({
      type: "payment",
      amount,
      notes,
      paymentMethod: paymentMethod || "Cash",
    });

    await person.save();
    res.json(formatPerson(person));
  } catch (err) {
    next(err);
  }
}

//
// PAY ALL DEBTS
//
export async function payAllDebts(req, res, next) {
  try {
    const person = await Person.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!person) {
      res.status(404);
      throw new Error("Person not found");
    }

    const balance = person.debts.reduce((acc, d) => {
      return d.type === "debt" ? acc + d.amount : acc - d.amount;
    }, 0);

    if (balance <= 0) {
      return res.json(formatPerson(person));
    }

    person.debts.push({
      type: "payment",
      amount: balance,
      notes: "Full payment",
      paymentMethod: "Cash",
    });

    await person.save();
    res.json(formatPerson(person));
  } catch (err) {
    next(err);
  }
}

//
// UPDATE DEBT / PAYMENT
//
export async function updateDebt(req, res, next) {
  try {
    const { amount, notes, paymentMethod, date } = req.body;

    const person = await Person.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!person) {
      res.status(404);
      throw new Error("Person not found");
    }

    const debt = person.debts.id(req.params.debtId);
    if (!debt) {
      res.status(404);
      throw new Error("Debt/Payment not found");
    }

    // Only validate amount for debt/payment
    if (amount !== undefined && amount <= 0) {
      res.status(400);
      throw new Error("Amount must be greater than 0");
    }

    debt.amount = amount ?? debt.amount;
    debt.notes = notes ?? debt.notes;
    debt.paymentMethod = paymentMethod ?? debt.paymentMethod;
    debt.date = date ?? debt.date;

    await person.save();
    res.json(formatPerson(person));
  } catch (err) {
    next(err);
  }
}

//
// DELETE DEBT / PAYMENT
//
export async function deleteDebt(req, res, next) {
  try {
    const person = await Person.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!person) {
      res.status(404);
      throw new Error("Person not found");
    }

    const debt = person.debts.id(req.params.debtId);
    if (!debt) {
      res.status(404);
      throw new Error("Debt/Payment not found");
    }

    debt.remove(); // Mongoose subdocument remove
    await person.save();

    res.json(formatPerson(person));
  } catch (err) {
    next(err);
  }
}