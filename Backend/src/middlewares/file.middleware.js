const multer = require("multer")


const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 3 * 1024 * 1024 // 3MB
    },
    fileFilter: (_req, file, callback) => {
        const isPdf = file.mimetype === "application/pdf" || file.originalname.toLowerCase().endsWith(".pdf")
        callback(isPdf ? null : new Error("Only PDF resumes are supported."), isPdf)
    },
})


module.exports = upload
