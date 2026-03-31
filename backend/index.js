import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/config.js";
import userRoutes from "./routes/UserRoute.js";
import productRoutes from "./routes/ProductRoute.js";
import personRoutes from "./routes/PersonRoute.js";
import orderRoutes from "./routes/OrderRoute.js";
import financialRoutes from "./routes/FinancialRoute.js";
import invoiceRoutes from "./routes/InvoiceRoute.js";
import expenseRoutes from "./routes/ExpenseRoute.js";
import { errorHandler } from "./middleware/errorMiddleware.js";
import { logger } from "./middleware/logger.js";
import cors from "cors";

dotenv.config();
const app = express();
app.use(logger);

app.get("/", (req, res) => {
  res.send("hello world");
});

const allowedOrigins = [
  "http://localhost:5173", // dev

  "https://serveflow.netlify.app", // production
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/people", personRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/financials", financialRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/expenses", expenseRoutes);

app.use(errorHandler);

app.listen(5000, () => {
  connectDB();
  console.log("Server is listening on port http://localhost:5000");
});
