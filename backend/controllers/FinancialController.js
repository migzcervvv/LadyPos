import Expense from "../models/Expense.js";
import Order from "../models/Order.js";
import Person from "../models/Person.js";
import dayjs from "dayjs";

export const getFinanceSummary = async (req, res) => {
  try {
    const { range = "daily" } = req.query;
    const now = dayjs();

    let startDate;

    if (range === "daily") startDate = now.subtract(6, "day");
    else if (range === "weekly")
      startDate = now.subtract(7, "week").startOf("week");
    else if (range === "monthly")
      startDate = now.subtract(5, "month").startOf("month");
    else return res.status(400).json({ error: "Invalid range" });

    // =====================
    // FETCH DATA
    // =====================

    const orders = await Order.find({
      userId: req.user.id,
      date: { $gte: startDate.toDate() },
    });

    const expenses = await Expense.find({
      userId: req.user.id,
      date: { $gte: startDate.toDate() },
    });

    // ⚠️ Still needed for payments (we'll optimize later if needed)
    const persons = await Person.find({ userId: req.user.id });

    // =====================
    // PREPARE MAP
    // =====================

    const map = {};

    const getKey = (date) => {
      if (range === "daily") return dayjs(date).format("YYYY-MM-DD");
      if (range === "weekly")
        return dayjs(date).startOf("week").format("YYYY-MM-DD");
      if (range === "monthly")
        return dayjs(date).startOf("month").format("YYYY-MM-DD");
    };

    const ensure = (key) => {
      if (!map[key]) {
        map[key] = {
          revenue: 0,
          cashIn: 0,
          expenses: 0,
          debtCreated: 0,
          debtCollected: 0,
        };
      }
    };

    // =====================
    // PROCESS ORDERS
    // =====================

    orders.forEach((o) => {
      const key = getKey(o.date);
      ensure(key);

      if (o.paymentStatus === "paid") {
        map[key].revenue += o.total;
        map[key].cashIn += o.total;
      }

      if (o.paymentStatus === "debt") {
        map[key].debtCreated += o.total;
      }
    });

    // =====================
    // PROCESS PAYMENTS
    // =====================

    const payments = [];

    persons.forEach((p) => {
      p.debts.forEach((d) => {
        if (d.kind === "payment" && d.date >= startDate.toDate()) {
          payments.push(d);
        }
      });
    });

    payments.forEach((p) => {
      const key = getKey(p.date);
      ensure(key);

      map[key].debtCollected += p.amount;
      map[key].cashIn += p.amount;
      map[key].revenue += p.amount;
    });

    // =====================
    // PROCESS EXPENSES
    // =====================

    expenses.forEach((e) => {
      const key = getKey(e.date);
      ensure(key);

      map[key].expenses += e.amount;
    });

    // =====================
    // BUILD BREAKDOWN
    // =====================

    const breakdown = [];

    const build = (count, unit) => {
      for (let i = count; i >= 0; i--) {
        let d = now.subtract(i, unit);

        if (unit === "week") d = d.startOf("week");
        if (unit === "month") d = d.startOf("month");

        const key = getKey(d);
        const data = map[key] || {
          revenue: 0,
          cashIn: 0,
          expenses: 0,
          debtCreated: 0,
          debtCollected: 0,
        };

        breakdown.push({
          label: unit === "month" ? d.format("MMM") : d.format("MMM D"),
          raw: key,
          ...data,
          net: data.revenue - data.expenses,
        });
      }
    };

    if (range === "daily") build(6, "day");
    if (range === "weekly") build(7, "week");
    if (range === "monthly") build(5, "month");

    // =====================
    // RECEIVABLES (KEY FEATURE)
    // =====================

    let totalOutstanding = 0;
    let overdue = 0;
    let notDue = 0;

    const today = dayjs();

    persons.forEach((p) => {
      let balance = 0;

      p.debts.forEach((d) => {
        if (d.kind === "charge") balance += d.amount;
        if (d.kind === "payment") balance -= d.amount;
      });

      if (balance > 0) {
        totalOutstanding += balance;

        // simple overdue logic (customize later)
        const lastDebt = p.debts[p.debts.length - 1];
        if (
          lastDebt &&
          dayjs(lastDebt.date).isBefore(today.subtract(7, "day"))
        ) {
          overdue += balance;
        } else {
          notDue += balance;
        }
      }
    });

    // =====================
    // TOTALS
    // =====================

    const total = breakdown.reduce(
      (acc, curr) => {
        acc.revenue += curr.revenue;
        acc.cashIn += curr.cashIn;
        acc.expenses += curr.expenses;
        acc.net += curr.net;
        acc.debtCreated += curr.debtCreated;
        acc.debtCollected += curr.debtCollected;
        return acc;
      },
      {
        revenue: 0,
        cashIn: 0,
        expenses: 0,
        net: 0,
        debtCreated: 0,
        debtCollected: 0,
      },
    );

    res.json({
      total,
      breakdown,
      receivables: {
        total: totalOutstanding,
        overdue,
        notDue,
      },
      rangeLabel: `${startDate.format("MMM D")} - ${now.format("MMM D")}`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
