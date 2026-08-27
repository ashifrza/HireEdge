const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();
app.set("trust proxy", 1);

app.disable("x-powered-by");
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

// ✅ FIX: Dynamic CORS — works correctly for both local dev and production
const allowedOrigins = [
  "http://localhost:5173",
  "https://hire-edge-mocha.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (e.g. mobile apps, Postman, curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy: origin ${origin} not allowed`));
    },
    credentials: true,
  }),
);

app.get("/", (req, res) => {
  res.status(200).json({ status: "ok", service: "HireEdge API" });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

/* require all the routes here */
const authRouter = require("./routes/auth.routes");
const interviewRouter = require("./routes/interview.routes");

/* using all the routes here */
app.use("/api/auth", authRouter);
app.use("/api/interview", interviewRouter);

app.use((err, req, res, next) => {
  console.error("Global error handler:", err.message);
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ message: "Resume must be smaller than 3MB." });
  }
  res.status(err.statusCode || err.status || 500).json({
    message: err.publicMessage || "Internal server error.",
  });
});

module.exports = app;
