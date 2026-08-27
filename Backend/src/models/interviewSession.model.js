const mongoose = require("mongoose");

const scoreSchema = new mongoose.Schema(
  {
    relevance: { type: Number, min: 0, max: 100, default: 0 },
    accuracy: { type: Number, min: 0, max: 100, default: 0 },
    structure: { type: Number, min: 0, max: 100, default: 0 },
    evidence: { type: Number, min: 0, max: 100, default: 0 },
    communication: { type: Number, min: 0, max: 100, default: 0 },
  },
  { _id: false },
);

const answerSchema = new mongoose.Schema(
  {
    questionKey: { type: String, required: true },
    question: { type: String, required: true },
    answerText: { type: String, required: true },
    scores: { type: scoreSchema, required: true },
    overallScore: { type: Number, min: 0, max: 100, required: true },
    strengths: [{ type: String }],
    improvements: [{ type: String }],
    improvedAnswerOutline: { type: String, default: "" },
    followUpQuestion: { type: String, default: "" },
  },
  { timestamps: true },
);

const interviewSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true,
    },
    interviewReport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InterviewReport",
      required: true,
      index: true,
    },
    mode: {
      type: String,
      enum: ["technical", "behavioral", "mixed"],
      default: "mixed",
    },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "intermediate",
    },
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },
    answers: [answerSchema],
    overallScore: { type: Number, min: 0, max: 100, default: 0 },
    completedAt: { type: Date },
  },
  { timestamps: true },
);

interviewSessionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("InterviewSession", interviewSessionSchema);
