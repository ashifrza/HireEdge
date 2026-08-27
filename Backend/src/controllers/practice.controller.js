const interviewReportModel = require("../models/interviewReport.model");
const interviewSessionModel = require("../models/interviewSession.model");
const { evaluateInterviewAnswer } = require("../services/ai.service");

function getQuestion(report, questionKey) {
  const [type, rawIndex] = String(questionKey || "").split(":");
  const index = Number(rawIndex);
  const list = type === "technical"
    ? report.technicalQuestions
    : type === "behavioral"
      ? report.behavioralQuestions
      : null;

  if (!list || !Number.isInteger(index) || index < 0 || index >= list.length) {
    return null;
  }

  return { type, index, item: list[index] };
}

async function createSessionController(req, res) {
  const { reportId } = req.params;
  const { mode = "mixed", difficulty = "intermediate" } = req.body;

  const report = await interviewReportModel.findOne({
    _id: reportId,
    user: req.user.id,
  });

  if (!report) return res.status(404).json({ message: "Interview plan not found." });

  const session = await interviewSessionModel.create({
    user: req.user.id,
    interviewReport: report._id,
    mode,
    difficulty,
  });

  res.status(201).json({ message: "Practice session created.", session });
}

async function submitAnswerController(req, res) {
  const { sessionId } = req.params;
  const { questionKey, answerText } = req.body;

  if (!questionKey || !answerText?.trim()) {
    return res.status(400).json({ message: "Question and answer are required." });
  }
  if (answerText.trim().length < 20) {
    return res.status(400).json({ message: "Add a little more detail before submitting." });
  }
  if (answerText.length > 6000) {
    return res.status(400).json({ message: "Answer must be under 6,000 characters." });
  }

  const session = await interviewSessionModel.findOne({
    _id: sessionId,
    user: req.user.id,
  });
  if (!session) return res.status(404).json({ message: "Practice session not found." });
  if (session.status === "completed") {
    return res.status(409).json({ message: "This practice session is already complete." });
  }

  const report = await interviewReportModel.findOne({
    _id: session.interviewReport,
    user: req.user.id,
  });
  if (!report) return res.status(404).json({ message: "Interview plan not found." });

  const resolved = getQuestion(report, questionKey);
  if (!resolved) return res.status(400).json({ message: "Invalid interview question." });

  const evaluation = await evaluateInterviewAnswer({
    roleTitle: report.title,
    mode: resolved.type,
    difficulty: session.difficulty,
    question: resolved.item.question,
    intention: resolved.item.intention,
    modelAnswer: resolved.item.answer,
    answerText: answerText.trim(),
  });

  session.answers.push({
    questionKey,
    question: resolved.item.question,
    answerText: answerText.trim(),
    ...evaluation,
  });
  session.overallScore = Math.round(
    session.answers.reduce((sum, answer) => sum + answer.overallScore, 0) /
      session.answers.length,
  );
  await session.save();

  res.status(201).json({
    message: "Answer evaluated.",
    evaluation: session.answers.at(-1),
    session,
  });
}

async function completeSessionController(req, res) {
  const session = await interviewSessionModel.findOne({
    _id: req.params.sessionId,
    user: req.user.id,
  });
  if (!session) return res.status(404).json({ message: "Practice session not found." });

  session.status = "completed";
  session.completedAt = session.completedAt || new Date();
  await session.save();
  res.json({ message: "Practice session completed.", session });
}

async function getSessionController(req, res) {
  const session = await interviewSessionModel
    .findOne({ _id: req.params.sessionId, user: req.user.id })
    .populate("interviewReport", "title matchScore technicalQuestions behavioralQuestions");
  if (!session) return res.status(404).json({ message: "Practice session not found." });
  res.json({ session });
}

async function getProgressController(req, res) {
  const sessions = await interviewSessionModel
    .find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .limit(30)
    .populate("interviewReport", "title");

  const completed = sessions.filter((session) => session.status === "completed");
  const allAnswers = sessions.flatMap((session) => session.answers);
  const averageScore = allAnswers.length
    ? Math.round(allAnswers.reduce((sum, answer) => sum + answer.overallScore, 0) / allAnswers.length)
    : 0;

  const scoreTotals = ["relevance", "accuracy", "structure", "evidence", "communication"]
    .map((skill) => ({
      skill,
      score: allAnswers.length
        ? Math.round(allAnswers.reduce((sum, answer) => sum + (answer.scores?.[skill] || 0), 0) / allAnswers.length)
        : 0,
    }));

  res.json({
    progress: {
      totalSessions: sessions.length,
      completedSessions: completed.length,
      answersPracticed: allAnswers.length,
      averageScore,
      skillScores: scoreTotals,
      recentSessions: sessions.slice(0, 6),
    },
  });
}

module.exports = {
  createSessionController,
  submitAnswerController,
  completeSessionController,
  getSessionController,
  getProgressController,
};
