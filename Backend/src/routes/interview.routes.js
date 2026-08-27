const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const interviewController = require("../controllers/interview.controller");
const upload = require("../middlewares/file.middleware");
const practiceController = require("../controllers/practice.controller");
const { createRateLimit } = require("../middlewares/rateLimit.middleware");

const aiRateLimit = createRateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  message: "AI request limit reached. Please wait a few minutes and try again.",
});

const interviewRouter = express.Router();

/**
 * @route POST /api/interview/
 * @description generate new interview report
 * @access private
 */
interviewRouter.post(
  "/",
  authMiddleware.authUser,
  aiRateLimit,
  upload.single("resume"),
  interviewController.generateInterViewReportController,
);

interviewRouter.post(
  "/report/:reportId/sessions",
  authMiddleware.authUser,
  practiceController.createSessionController,
);

interviewRouter.post(
  "/sessions/:sessionId/answers",
  authMiddleware.authUser,
  aiRateLimit,
  practiceController.submitAnswerController,
);

interviewRouter.post(
  "/sessions/:sessionId/complete",
  authMiddleware.authUser,
  practiceController.completeSessionController,
);

interviewRouter.get(
  "/sessions/:sessionId",
  authMiddleware.authUser,
  practiceController.getSessionController,
);

interviewRouter.get(
  "/progress",
  authMiddleware.authUser,
  practiceController.getProgressController,
);

/**
 * @route GET /api/interview/report/:interviewId
 * @description get interview report by interviewId
 * @access private
 */
interviewRouter.get(
  "/report/:interviewId",
  authMiddleware.authUser,
  interviewController.getInterviewReportByIdController,
);

/**
 * @route DELETE /api/interview/report/:interviewId
 * @description delete interview report by interviewId
 * @access private
 */
interviewRouter.delete(
  "/report/:interviewId",
  authMiddleware.authUser,
  interviewController.deleteInterviewReportController,
);

interviewRouter.patch(
  "/report/:interviewId/progress",
  authMiddleware.authUser,
  interviewController.updateReportProgressController,
);

/**
 * @route GET /api/interview/
 * @description get all interview reports of logged in user
 * @access private
 */
interviewRouter.get(
  "/",
  authMiddleware.authUser,
  interviewController.getAllInterviewReportsController,
);

/**
 * @route POST /api/interview/resume/pdf/:interviewReportId
 * @description generate resume pdf
 * @access private
 */
interviewRouter.post(
  "/resume/pdf/:interviewReportId",
  authMiddleware.authUser,
  aiRateLimit,
  interviewController.generateResumePdfController,
);

module.exports = interviewRouter;
