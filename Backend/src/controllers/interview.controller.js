const pdfParseModule = require("pdf-parse");
const pdfParse = pdfParseModule.default || pdfParseModule;
const {
  generateInterviewReport,
  generateResumePdf,
} = require("../services/ai.service");
const interviewReportModel = require("../models/interviewReport.model");

/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */
async function generateInterViewReportController(req, res) {
  try {
    const { selfDescription = "", jobDescription } = req.body;

    if (!jobDescription?.trim()) {
      return res.status(400).json({ message: "Job description is required." });
    }
    if (jobDescription.length > 12000 || selfDescription.length > 8000) {
      return res.status(400).json({ message: "The supplied text is too long." });
    }

    let resumeText = "";

    if (req.file && req.file.buffer) {
      try {
        const parsed = await pdfParse(req.file.buffer);
        resumeText = parsed.text || "";
      } catch (pdfErr) {
        console.error("PDF parse error:", pdfErr.message);
        // Don't crash — fallback to selfDescription only
      }
    }

    if (!resumeText.trim() && !selfDescription.trim()) {
      return res
        .status(400)
        .json({ message: "Please provide a resume or self-description." });
    }

    const interViewReportByAi = await generateInterviewReport({
      resume: resumeText,
      selfDescription,
      jobDescription,
    });

    const interviewReport = await interviewReportModel.create({
      user: req.user.id,
      resume: resumeText,
      selfDescription,
      jobDescription,
      ...interViewReportByAi,
    });

    res.status(201).json({
      message: "Interview report generated successfully.",
      interviewReport,
    });
  } catch (err) {
    console.error("generateInterViewReportController error:", err.message);
    res
      .status(err.statusCode || 500)
      .json({ message: err.publicMessage || "Failed to generate interview report. Please retry." });
  }
}

/**
 * @description Controller to get interview report by interviewId.
 */
async function getInterviewReportByIdController(req, res) {
  try {
    const { interviewId } = req.params;
    const interviewReport = await interviewReportModel.findOne({
      _id: interviewId,
      user: req.user.id,
    });

    if (!interviewReport) {
      return res.status(404).json({ message: "Interview report not found." });
    }

    res.status(200).json({
      message: "Interview report fetched successfully.",
      interviewReport,
    });
  } catch (err) {
    console.error("getInterviewReportByIdController error:", err.message);
    res.status(500).json({ message: "Failed to fetch report." });
  }
}

/**
 * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res) {
  try {
    const interviewReports = await interviewReportModel
      .find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .select(
        "-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan",
      );

    res.status(200).json({
      message: "Interview reports fetched successfully.",
      interviewReports,
    });
  } catch (err) {
    console.error("getAllInterviewReportsController error:", err.message);
    res.status(500).json({ message: "Failed to fetch reports." });
  }
}

/**
 * @description Controller to delete interview report by interviewId.
 */
async function deleteInterviewReportController(req, res) {
  try {
    const { interviewId } = req.params;
    const deleted = await interviewReportModel.findOneAndDelete({
      _id: interviewId,
      user: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Interview report not found." });
    }

    res.status(200).json({ message: "Interview report deleted successfully." });
  } catch (err) {
    console.error("deleteInterviewReportController error:", err.message);
    res.status(500).json({ message: "Failed to delete report." });
  }
}

/**
 * @description Controller to generate resume PDF based on user self description, resume and job description.
 */
async function generateResumePdfController(req, res) {
  try {
    const { interviewReportId } = req.params;
    const interviewReport = await interviewReportModel.findOne({
      _id: interviewReportId,
      user: req.user.id,
    });

    if (!interviewReport) {
      return res.status(404).json({ message: "Interview report not found." });
    }

    const { resume, jobDescription, selfDescription, atsResume } = interviewReport;
    const result = await generateResumePdf({
      resume,
      jobDescription,
      selfDescription,
      atsResume,
    });

    if (result.atsResume && result.atsResume.schemaVersion === 2 && atsResume?.schemaVersion !== 2) {
      interviewReport.atsResume = result.atsResume;
      await interviewReport.save();
    }

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`,
      "Content-Length": result.pdfBuffer.length,
      "X-Resume-Mode": result.usedFallback ? "fallback" : "enhanced",
    });

    res.end(result.pdfBuffer);
  } catch (err) {
    console.error("generateResumePdfController error:", err.message);
    res
      .status(err.statusCode || 500)
      .json({ message: err.publicMessage || "Failed to generate resume PDF." });
  }
}

async function updateReportProgressController(req, res) {
  const { reviewedQuestionKeys, completedPlanTasks } = req.body;
  const update = {};

  if (reviewedQuestionKeys !== undefined) {
    if (!Array.isArray(reviewedQuestionKeys) || reviewedQuestionKeys.length > 100) {
      return res.status(400).json({ message: "Invalid reviewed questions." });
    }
    update.reviewedQuestionKeys = reviewedQuestionKeys.map(String);
  }
  if (completedPlanTasks !== undefined) {
    if (!Array.isArray(completedPlanTasks) || completedPlanTasks.length > 100) {
      return res.status(400).json({ message: "Invalid plan progress." });
    }
    update.completedPlanTasks = completedPlanTasks.map(String);
  }

  const interviewReport = await interviewReportModel.findOneAndUpdate(
    { _id: req.params.interviewId, user: req.user.id },
    { $set: update },
    { new: true },
  );
  if (!interviewReport) return res.status(404).json({ message: "Interview report not found." });

  res.json({ message: "Progress saved.", interviewReport });
}

module.exports = {
  generateInterViewReportController,
  getInterviewReportByIdController,
  getAllInterviewReportsController,
  deleteInterviewReportController,
  generateResumePdfController,
  updateReportProgressController,
};
