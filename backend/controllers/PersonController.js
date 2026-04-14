import Person from "../models/Person.js";

//
// HELPERS
//
function computeBalance(transactions) {
  return transactions.reduce((acc, t) => {
    if (t.kind === "charge") return acc + t.amount;
    if (t.kind === "payment" && t.context === "debt") return acc - t.amount;
    return acc;
  }, 0);
}

//
// PERSON CRUD
//

export async function createPerson(req, res) {
  try {
    const { name, contactInfo, notes } = req.body;

    const person = new Person({
      userId: req.user.id,
      name,
      contactInfo,
      notes,
      debts: [],
    });

    await person.save();
    res.json(person);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getPeople(req, res) {
  try {
    const people = await Person.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });

    const result = people.map((p) => {
      const balance = computeBalance(p.debts);
      return {
        ...p.toObject(),
        balance,
        transactions: p.debts,
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getPersonById(req, res) {
  try {
    const person = await Person.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!person) return res.status(404).json({ error: "Person not found" });

    const balance = computeBalance(person.debts);

    res.json({
      ...person.toObject(),
      balance,
      transactions: person.debts,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updatePerson(req, res) {
  try {
    const { name, contactInfo, notes } = req.body;

    const person = await Person.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { name, contactInfo, notes },
      { new: true },
    );

    if (!person) return res.status(404).json({ error: "Person not found" });

    res.json(person);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deletePerson(req, res) {
  try {
    const person = await Person.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!person) return res.status(404).json({ error: "Person not found" });

    res.json({ message: "Person deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

//
// TRANSACTIONS
//

export async function addDebt(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const person = await Person.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!person) {
      return res.status(404).json({ error: "Person not found" });
    }

    const amount = Number(req.body.amount);
    const notes = req.body.notes || "";

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const newDebt = {
      kind: "charge",
      context: "debt",
      amount,
      notes,
      paymentMethod: "Cash",
      date: new Date(),
    };

    person.debts.push(newDebt);

    await person.save();

    res.json(person);
  } catch (err) {
    console.error("ADD DEBT ERROR FULL:", err);
    res.status(500).json({ error: err.message });
  }
}

export async function addPayment(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const person = await Person.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!person) {
      return res.status(404).json({ error: "Person not found" });
    }

    const amount = Number(req.body.amount);
    const notes = req.body.notes || "";

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const newPayment = {
      kind: "payment",
      context: "debt",
      amount,
      notes,
      paymentMethod: "Cash",
      date: new Date(),
    };

    person.debts.push(newPayment);

    await person.save();

    res.json(person);
  } catch (err) {
    console.error("FULL ERROR:", err); // 🔥 THIS will finally show truth
    res.status(500).json({ error: err.message });
  }
}

export async function payAllDebts(req, res) {
  try {
    const person = await Person.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!person) return res.status(404).json({ error: "Person not found" });

    const balance = computeBalance(person.debts);

    if (balance <= 0) return res.json({ message: "No outstanding debt" });

    person.debts.push({
      kind: "payment",
      context: "debt",
      amount: balance,
      notes: "Full settlement",
      paymentMethod: "Cash",
      date: new Date(),
    });

    await person.save();

    res.json({ message: "All debts paid" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateDebt(req, res) {
  try {
    const { id, debtId } = req.params;

    const person = await Person.findOne({
      _id: id,
      userId: req.user.id,
    });

    if (!person) return res.status(404).json({ error: "Person not found" });

    const txn = person.debts.id(debtId);

    if (!txn) return res.status(404).json({ error: "Transaction not found" });

    const { amount, notes } = req.body;

    if (amount !== undefined) txn.amount = amount;
    if (notes !== undefined) txn.notes = notes;

    await person.save();

    res.json({ message: "Transaction updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteDebt(req, res) {
  try {
    const { id, debtId } = req.params;

    const person = await Person.findOne({
      _id: id,
      userId: req.user.id,
    });

    if (!person) return res.status(404).json({ error: "Person not found" });

    person.debts = person.debts.filter((d) => d._id.toString() !== debtId);

    await person.save();

    res.json({ message: "Transaction deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
