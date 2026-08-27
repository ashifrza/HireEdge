const mongoose = require("mongoose")



async function connectToDB() {
    const isProduction = process.env.NODE_ENV === "production"
    const localUri = process.env.MONGO_LOCAL_URI || "mongodb://127.0.0.1:27017/hireedge"
    const candidates = isProduction ? [process.env.MONGO_URI] : [localUri, process.env.MONGO_URI]
    let lastError

    for (const uri of candidates.filter(Boolean)) {
        try {
            await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 })
            console.log(`Connected to ${uri === localUri ? "local" : "hosted"} database`)
            return
        }
        catch (err) {
            lastError = err
            await mongoose.disconnect().catch(() => {})
        }
    }

    console.error("Database connection failed:", lastError?.message)
    throw lastError || new Error("MONGO_URI is not configured")
}

module.exports = connectToDB
