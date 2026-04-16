const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true })) // ✅ ADDED: support for form-urlencoded bodies
app.use(cookieParser())

// ✅ FIX: Dynamic CORS — works correctly for both local dev and production
const allowedOrigins = [
    "http://localhost:5173",
    "https://hire-edge-mocha.vercel.app"
]

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (e.g. mobile apps, Postman, curl)
        if (!origin) return callback(null, true)
        if (allowedOrigins.includes(origin)) {
            return callback(null, true)
        }
        return callback(new Error(`CORS policy: origin ${origin} not allowed`))
    },
    credentials: true
}))

app.get("/", (req, res) => {
    res.status(200).send("Backend is running")
})

/* require all the routes here */
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")

/* using all the routes here */
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

app.use((err, req, res, next) => {
    console.error("Global error handler:", err.message)
    res.status(err.status || 500).json({
        message: err.message || "Internal server error"
    })
})

module.exports = app