import Expense from "../models/Expense.js";
import Order from "../models/Order.js";
import Person from "../models/Person.js";
import dayjs from "dayjs";

export const getFinanceSummary = async (req, res) => {
  try {
    const { range = "daily" } = req.query;

    const now = dayjs();
    let startDate;
    let breakdown = [];

    if (range === "daily") {
      startDate = now.subtract(6, "day");
    } else if (range === "weekly") {
      startDate = now.subtract(7, "week");
    } else if (range === "monthly") {
      startDate = now.subtract(5, "month");
    } else {
      return res.status(400).json({ error: "Invalid range" });
    }

    // =====================
    // FETCH DATA
    // =====================
    const paidOrders = await Order.find({
      userId: req.user.id,
      paymentStatus: "paid",
      createdAt: { $gte: startDate.toDate() },
    });

    const persons = await Person.find({ userId: req.user.id });

    const payments = [];
    persons.forEach((p) => {
      p.debts.forEach((d) => {
        if (d.type === "payment" && d.date >= startDate.toDate()) {
          payments.push(d);
        }
      });
    });

    const expenses = await Expense.find({
      createdBy: req.user.id,
      date: { $gte: startDate.toDate() },
    });

    const map = {};

    const getKey = (date) => {
      if (range === "daily") return dayjs(date).format("YYYY-MM-DD");
      if (range === "weekly") return dayjs(date).format("YYYY-[W]WW");
      if (range === "monthly") return dayjs(date).format("YYYY-MM");
    };

    // 💰 ORDERS
    paidOrders.forEach((o) => {
      const key = getKey(o.createdAt);
      if (!map[key]) map[key] = { gross: 0, expenses: 0 };
      map[key].gross += o.total;
    });

    // 💰 PAYMENTS
    payments.forEach((p) => {
      const key = getKey(p.date);
      if (!map[key]) map[key] = { gross: 0, expenses: 0 };
      map[key].gross += p.amount;
    });

    // 💸 EXPENSES
    expenses.forEach((e) => {
      const key = getKey(e.date);
      if (!map[key]) map[key] = { gross: 0, expenses: 0 };
      map[key].expenses += e.amount;
    });

    // =====================
    // NORMALIZE DATA
    // =====================
    if (range === "daily") {
      for (let i = 6; i >= 0; i--) {
        const d = now.subtract(i, "day");
        const key = d.format("YYYY-MM-DD");
        const data = map[key] || { gross: 0, expenses: 0 };

        breakdown.push({
          label: d.format("MMM D"),
          raw: key,
          gross: data.gross,
          expenses: data.expenses,
          net: data.gross - data.expenses,
        });
      }
    }

    if (range === "weekly") {
      for (let i = 7; i >= 0; i--) {
        const d = now.subtract(i, "week");
        const start = d.startOf("week");
        const end = d.endOf("week");

        const key = d.format("YYYY-[W]WW");
        const data = map[key] || { gross: 0, expenses: 0 };

        breakdown.push({
          label: `${start.format("MMM D")}`, // 👈 clean label
          raw: key,
          gross: data.gross,
          expenses: data.expenses,
          net: data.gross - data.expenses,
        });
      }
    }

    if (range === "monthly") {
      for (let i = 5; i >= 0; i--) {
        const d = now.subtract(i, "month");
        const key = d.format("YYYY-MM");
        const data = map[key] || { gross: 0, expenses: 0 };

        breakdown.push({
          label: d.format("MMM"),
          raw: key,
          gross: data.gross,
          expenses: data.expenses,
          net: data.gross - data.expenses,
        });
      }
    }

    // =====================
    // TOTAL
    // =====================
    const total = breakdown.reduce(
      (acc, curr) => {
        acc.gross += curr.gross;
        acc.expenses += curr.expenses;
        acc.net += curr.net;
        return acc;
      },
      { gross: 0, expenses: 0, net: 0 },
    );

    const rangeLabel = `${startDate.format("MMM D")} - ${now.format("MMM D")}`;

    res.json({ total, breakdown, rangeLabel });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
