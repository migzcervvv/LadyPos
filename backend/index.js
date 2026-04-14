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

// Logging middleware to capture all incoming requests

const logs = [];
const clients = [];

function pushLog(level, message) {
  const time = new Date().toLocaleTimeString();

  const log = {
    time,
    level,
    message,
  };

  logs.push(log);
  if (logs.length > 300) logs.shift();

  // send to all connected clients (SSE)
  clients.forEach((res) => {
    res.write(`data: ${JSON.stringify(log)}\n\n`);
  });

  // still log to console
  console._log(`[${time}] [${level.toUpperCase()}] ${message}`);
}

// preserve originals
console._log = console.log;

console.log = (msg) => pushLog("info", msg);
console.warn = (msg) => pushLog("warn", msg);
console.error = (msg) => pushLog("error", msg);
// Logging middleware to capture all incoming requests

app.use((req, res, next) => {
  console.log(`Incoming ${req.method} ${req.url}`);
  next();
});

app.get("/", (req, res) => {
  console.log("Server started");
  console.warn("This is a warning");
  console.error("Something broke");
  res.send(`
    <html>
    <head>
      <title>Live Logs</title>
      <style>
        body {
          background: #0d0d0d;
          color: #eaeaea;
          font-family: monospace;
          padding: 20px;
        }

        h2 {
          color: #00ff9c;
        }

        .log {
          margin: 4px 0;
        }

        .time {
          color: #888;
          margin-right: 10px;
        }

        .info { color: #00ff9c; }
        .warn { color: #ffcc00; }
        .error { color: #ff4d4d; }

        #logs {
          max-height: 90vh;
          overflow-y: auto;
        }
      </style>
    </head>
    <body>
      <h2>🚀 Live Server Logs</h2>
      <div id="logs"></div>

      <script>
        const logContainer = document.getElementById("logs");

        const evtSource = new EventSource("/logs-stream");

        evtSource.onmessage = function(event) {
          const log = JSON.parse(event.data);

          const div = document.createElement("div");
          div.className = "log " + log.level;

          div.innerHTML =
            '<span class="time">[' + log.time + ']</span>' +
            '<span>[' + log.level.toUpperCase() + ']</span> ' +
            log.message;

          logContainer.appendChild(div);

          // auto-scroll
          logContainer.scrollTop = logContainer.scrollHeight;
        };
      </script>
    </body>
    </html>
  `);
});

app.get("/logs-stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // send existing logs first
  logs.forEach((log) => {
    res.write(`data: ${JSON.stringify(log)}\n\n`);
  });

  clients.push(res);

  req.on("close", () => {
    const index = clients.indexOf(res);
    if (index !== -1) clients.splice(index, 1);
  });
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
