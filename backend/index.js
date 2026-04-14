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

const logs = [];

function addLog(message) {
  const time = new Date().toLocaleTimeString();
  const log = `[${time}] ${message}`;

  logs.push(log);

  // prevent memory explosion
  if (logs.length > 200) logs.shift();

  console._log(log);
}

// preserve original
console._log = console.log;
console.log = addLog;
app.use((req, res, next) => {
  console.log(`Incoming ${req.method} ${req.url}`);
  next();
});

app.get("/", (req, res) => {
  res.send(`
    <html>
    <head>
      <title>Server Logs</title>
      <meta http-equiv="refresh" content="2">
      <style>
        body {
          background: #0d0d0d;
          color: #00ff9c;
          font-family: monospace;
          padding: 20px;
        }
        .log {
          margin: 4px 0;
          white-space: pre;
        }
      </style>
    </head>
    <body>
      <h2>🚀 Live Server Logs</h2>
      ${logs.map((l) => `<div class="log">${l}</div>`).join("")}
    </body>
    <script>
      setInterval(() => {
        fetch("/")
          .then(res => res.text())
          .then(html => {
            document.body.innerHTML = html;
          });
      }, 2000);
    </script>
    <script>
      const evtSource = new EventSource('/logs-stream');
      evtSource.onmessage = function(event) {
        const div = document.createElement("div");
        div.textContent = event.data;
        document.body.appendChild(div);
      };
    </script>
    </html>
  `);
});

app.get("/logs-stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const interval = setInterval(() => {
    const lastLog = logs[logs.length - 1];
    if (lastLog) {
      res.write(`data: ${lastLog}\n\n`);
    }
  }, 1000);

  req.on("close", () => clearInterval(interval));
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
