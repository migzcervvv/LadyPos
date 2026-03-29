import Financial from "../models/Financial.js";
import Order from "../models/Order.js";
import Person from "../models/Person.js";

/**
 * 🔥 FINANCIAL DASHBOARD
 */
export async function getFinancialDashboard(req, res) {
  try {
    const userId = req.user.id;

    // ✅ Get completed orders
    const orders = await Order.find({
      userId,
      orderStatus: "completed",
    });

    let grossIncome = 0;
    let pendingReceivables = 0;

    orders.forEach((o) => {
      if (o.paymentStatus === "paid") {
        grossIncome += o.total;
      } else if (o.paymentStatus === "debt") {
        pendingReceivables += o.total;
      }
    });

    // ✅ Expenses
    const financial = await Financial.findOne({ userId });
    const expenses = financial?.expenses || [];

    const totalExpenses = expenses.reduce(
      (sum, e) => sum + Number(e.amount || 0),
      0,
    );

    // ✅ Net income
    const netIncome = grossIncome - totalExpenses;

    // ✅ Debt (ledger-based)
    const persons = await Person.find({ userId });

    let totalDebt = 0;

    persons.forEach((p) => {
      p.debts.forEach((d) => {
        if (d.type === "debt") totalDebt += d.amount;
        if (d.type === "payment") totalDebt -= d.amount;
      });
    });

    // ✅ ROI
    const capital = financial?.capitalInvested || 0;
    const roi = capital > 0 ? (netIncome / capital) * 100 : 0;

    res.json({
      grossIncome,
      pendingReceivables,
      totalExpenses,
      netIncome,
      totalDebt,
      capital,
      roi,
      totalOrders: orders.length,
    });
  } catch (err) {
    console.error("Financial Dashboard Error:", err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * 📊 FINANCIAL REPORT (DATE FILTER + DAILY)
 */
export async function getFinancialReport(req, res) {
  try {
    const userId = req.user.id;
    const { from, to } = req.query;

    const start = new Date(from);
    const end = new Date(to);

    const orders = await Order.find({
      userId,
      orderStatus: "completed",
      createdAt: { $gte: start, $lte: end },
    });

    let gross = 0;
    let receivables = 0;

    orders.forEach((o) => {
      if (o.paymentStatus === "paid") gross += o.total;
      if (o.paymentStatus === "debt") receivables += o.total;
    });

    // Expenses
    const financial = await Financial.findOne({ userId });

    const expenses = (financial?.expenses || []).filter((e) => {
      const d = new Date(e.date);
      return d >= start && d <= end;
    });

    const totalExpenses = expenses.reduce(
      (sum, e) => sum + Number(e.amount || 0),
      0,
    );

    const net = gross - totalExpenses;

    // Debt ledger
    const persons = await Person.find({ userId });

    let totalDebt = 0;

    persons.forEach((p) => {
      p.debts.forEach((d) => {
        if (d.type === "debt") totalDebt += d.amount;
        if (d.type === "payment") totalDebt -= d.amount;
      });
    });

    // Daily breakdown
    const dailyMap = {};

    orders.forEach((o) => {
      const day = new Date(o.createdAt).toISOString().split("T")[0];

      if (!dailyMap[day]) {
        dailyMap[day] = { gross: 0, receivables: 0 };
      }

      if (o.paymentStatus === "paid") {
        dailyMap[day].gross += o.total;
      } else {
        dailyMap[day].receivables += o.total;
      }
    });

    const daily = Object.entries(dailyMap).map(([date, val]) => ({
      date,
      ...val,
    }));

    res.json({
      summary: {
        gross,
        receivables,
        totalExpenses,
        net,
        totalOrders: orders.length,
        totalDebt,
      },
      daily,
    });
  } catch (err) {
    console.error("Financial Report Error:", err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * ➕ ADD EXPENSE
 */
export async function addExpense(req, res) {
  try {
    const { type, amount } = req.body;
    const userId = req.user.id;

    if (!type || !amount || amount <= 0) {
      return res.status(400).json({
        error: "Type and valid amount required",
      });
    }

    let financial = await Financial.findOne({ userId });

    if (!financial) {
      financial = new Financial({ userId, expenses: [] });
    }

    financial.expenses.push({
      type,
      amount,
      date: new Date(),
    });

    await financial.save();

    res.json(financial);
  } catch (err) {
    console.error("Add Expense Error:", err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * ❌ DELETE EXPENSE
 */
export async function deleteExpense(req, res) {
  try {
    const userId = req.user.id;
    const { expenseId } = req.params;

    const financial = await Financial.findOne({ userId });

    if (!financial) {
      return res.status(404).json({ error: "Not found" });
    }

    financial.expenses = financial.expenses.filter(
      (e) => e._id.toString() !== expenseId,
    );

    await financial.save();

    res.json({ message: "Expense deleted" });
  } catch (err) {
    console.error("Delete Expense Error:", err);
    res.status(500).json({ error: err.message });
  }
}

/**
 * ✏️ UPDATE CAPITAL
 */
export async function updateCapital(req, res) {
  try {
    const userId = req.user.id;
    const { capitalInvested } = req.body;

    let financial = await Financial.findOne({ userId });

    if (!financial) {
      financial = new Financial({ userId });
    }

    financial.capitalInvested = capitalInvested || 0;

    await financial.save();

    res.json(financial);
  } catch (err) {
    console.error("Update Capital Error:", err);
    res.status(500).json({ error: err.message });
  }
}
