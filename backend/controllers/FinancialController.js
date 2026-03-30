import Financial from "../models/Financial.js";
import Order from "../models/Order.js";
import Person from "../models/Person.js";

export async function getFinancialDashboard(req, res) {
  try {
    const userId = req.user.id;
    const days = Number(req.query.days) || 7;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // =====================
    // ORDERS
    // =====================
    const orders = await Order.find({
      userId,
      orderStatus: "completed",
      createdAt: { $gte: startDate },
    });

    let revenue = 0;
    let receivables = 0;
    let paidOrders = 0;

    orders.forEach((o) => {
      if (o.paymentStatus === "paid") {
        revenue += o.total;
        paidOrders += o.total;
      } else {
        receivables += o.total;
      }
    });

    // =====================
    // PERSON (DEBT + PAYMENTS)
    // =====================
    const persons = await Person.find({ userId });

    let totalDebt = 0;
    let totalPayments = 0;
    const debtorMap = [];

    persons.forEach((p) => {
      let balance = 0;

      p.debts.forEach((d) => {
        if (d.type === "debt") {
          totalDebt += d.amount;
          balance += d.amount;
        } else {
          totalDebt -= d.amount;
          totalPayments += d.amount;
          balance -= d.amount;
        }
      });

      if (balance > 0) {
        debtorMap.push({
          id: p._id,
          name: p.name,
          balance,
        });
      }
    });

    const topDebtors = debtorMap
      .sort((a, b) => b.balance - a.balance)
      .slice(0, 5);

    // =====================
    // EXPENSES
    // =====================
    const financial = await Financial.findOne({ userId });

    const expenses = (financial?.expenses || []).filter((e) => {
      const d = new Date(e.date);
      return d >= startDate;
    });

    const totalExpenses = expenses.reduce(
      (sum, e) => sum + Number(e.amount || 0),
      0,
    );

    // =====================
    // CASH FLOW
    // =====================
    const cashIn = paidOrders + totalPayments;
    const cashOut = totalExpenses;
    const netCashFlow = cashIn - cashOut;

    const netProfit = revenue - totalExpenses;

    // =====================
    // DAILY MAP
    // =====================
    const dailyMap = {};

    orders.forEach((o) => {
      const day = new Date(o.createdAt).toISOString().split("T")[0];

      if (!dailyMap[day]) {
        dailyMap[day] = {
          date: day,
          revenue: 0,
          receivables: 0,
          orders: 0,
        };
      }

      dailyMap[day].orders += 1;

      if (o.paymentStatus === "paid") {
        dailyMap[day].revenue += o.total;
      } else {
        dailyMap[day].receivables += o.total;
      }
    });

    const daily = Object.values(dailyMap);

    res.json({
      kpis: {
        revenue,
        receivables,
        totalDebt,
        totalExpenses,
        netProfit,
        cashIn,
        cashOut,
        netCashFlow,
      },
      daily,
      topDebtors,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

export async function getDebtorDetails(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const person = await Person.findOne({ _id: id, userId });

    if (!person) {
      return res.status(404).json({ error: "Not found" });
    }

    res.json(person.debts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getDayDetails(req, res) {
  try {
    const userId = req.user.id;
    const { date } = req.params;

    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);

    const orders = await Order.find({
      userId,
      orderStatus: "completed",
      createdAt: { $gte: start, $lt: end },
    }).populate("personId", "name");

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
