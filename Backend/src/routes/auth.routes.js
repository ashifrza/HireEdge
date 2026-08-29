const { Router } = require('express')
const authController = require("../controllers/auth.controller")
const passwordlessController = require("../controllers/passwordless.controller")
const authMiddleware = require("../middlewares/auth.middleware")
const { createRateLimit } = require("../middlewares/rateLimit.middleware")

const authRouter = Router()
const authRateLimit = createRateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: "Too many authentication attempts. Please try again later.",
})
const otpRequestRateLimit = createRateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Too many verification codes requested. Please wait and try again.",
})
const otpVerifyRateLimit = createRateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    message: "Too many verification attempts. Please wait and try again.",
})

authRouter.post("/otp/request", otpRequestRateLimit, passwordlessController.requestOtpController)
authRouter.post("/otp/verify", otpVerifyRateLimit, passwordlessController.verifyOtpController)
authRouter.post("/google", authRateLimit, passwordlessController.googleAuthController)

/**
 * @route POST /api/auth/register
 * @description Register a new user
 * @access Public
 */
authRouter.post("/register", authRateLimit, authController.registerUserController)


/**
 * @route POST /api/auth/login
 * @description login user with email and password
 * @access Public
 */
authRouter.post("/login", authRateLimit, authController.loginUserController)


/**
 * @route GET /api/auth/logout
 * @description clear token from user cookie and add the token in blacklist
 * @access public
 */
authRouter.post("/logout", authController.logoutUserController)


/**
 * @route GET /api/auth/get-me
 * @description get the current logged in user details
 * @access private
 */
authRouter.get("/get-me", authMiddleware.authUser, authController.getMeController)


module.exports = authRouter
