import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import toast from "react-hot-toast";
import Navbar from "../../shared/Navbar";
import {
  completePracticeSession,
  createPracticeSession,
  getInterviewReportById,
  submitPracticeAnswer,
} from "../services/interview.api";
import "../style/practice.scss";

const scoreLabels = {
  relevance: "Relevance",
  accuracy: "Accuracy",
  structure: "Structure",
  evidence: "Evidence",
  communication: "Communication",
};

const Practice = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [mode, setMode] = useState("mixed");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [session, setSession] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState(null);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    getInterviewReportById(interviewId)
      .then((data) => setReport(data.interviewReport))
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false));
    return () => recognitionRef.current?.stop?.();
  }, [interviewId]);

  const questions = useMemo(() => {
    if (!report) return [];
    const technical = report.technicalQuestions.map((item, index) => ({ ...item, key: `technical:${index}`, type: "Technical" }));
    const behavioral = report.behavioralQuestions.map((item, index) => ({ ...item, key: `behavioral:${index}`, type: "Behavioral" }));
    if (mode === "technical") return technical;
    if (mode === "behavioral") return behavioral;
    return technical.map((question, index) => [question, behavioral[index]]).flat().filter(Boolean);
  }, [report, mode]);

  const currentQuestion = questions[currentIndex];

  const startSession = async () => {
    setSubmitting(true);
    try {
      const data = await createPracticeSession(interviewId, { mode, difficulty });
      setSession(data.session);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSpeech = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Voice input is not supported in this browser.");
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    let finalText = answer;
    recognition.onresult = (event) => {
      let interim = "";
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        if (event.results[index].isFinal) finalText += `${finalText ? " " : ""}${event.results[index][0].transcript}`;
        else interim += event.results[index][0].transcript;
      }
      setAnswer(`${finalText}${interim ? ` ${interim}` : ""}`.trim());
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => { setListening(false); toast.error("Voice input stopped. You can continue typing."); };
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  const submitAnswer = async () => {
    if (answer.trim().length < 20) {
      toast.error("Add a little more detail before submitting.");
      return;
    }
    recognitionRef.current?.stop?.();
    setSubmitting(true);
    try {
      const data = await submitPracticeAnswer(session._id, {
        questionKey: currentQuestion.key,
        answerText: answer,
      });
      setEvaluation(data.evaluation);
      setEvaluations((items) => [...items, data.evaluation]);
      setSession(data.session);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const goNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((index) => index + 1);
      setAnswer("");
      setEvaluation(null);
      return;
    }
    setSubmitting(true);
    try {
      const data = await completePracticeSession(session._id);
      setSession(data.session);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <main className="practice-loading"><div /><p>Preparing your practice room...</p></main>;
  if (!report) return <main className="practice-empty"><h1>Interview plan unavailable</h1><button onClick={() => navigate("/dashboard")}>Back to dashboard</button></main>;

  if (!session) return (
    <div className="practice-page">
      <Navbar showBack title="Practice setup" />
      <main className="practice-setup">
        <p className="practice-kicker">PERSONALIZED PRACTICE</p>
        <h1>Run a focused mock interview for <span>{report.title}</span>.</h1>
        <p className="practice-lead">Answer in your own words. HireEdge will score the content and coach you on what to improve.</p>
        <section className="practice-settings">
          <fieldset><legend>Question type</legend><div className="practice-options">
            {["mixed", "technical", "behavioral"].map((value) => <button type="button" key={value} className={mode === value ? "active" : ""} onClick={() => setMode(value)}><b>{value}</b><small>{value === "mixed" ? "Balanced practice" : `${value} questions only`}</small></button>)}
          </div></fieldset>
          <fieldset><legend>Difficulty</legend><div className="practice-options">
            {["beginner", "intermediate", "advanced"].map((value) => <button type="button" key={value} className={difficulty === value ? "active" : ""} onClick={() => setDifficulty(value)}><b>{value}</b><small>{value === "beginner" ? "Clear fundamentals" : value === "intermediate" ? "Real interview depth" : "Senior-level pressure"}</small></button>)}
          </div></fieldset>
        </section>
        <div className="practice-setup__footer"><span>{questions.length} questions · feedback after each answer</span><button onClick={startSession} disabled={submitting}>{submitting ? "Creating session..." : "Start interview"}</button></div>
      </main>
    </div>
  );

  if (session.status === "completed") {
    const average = evaluations.length ? Math.round(evaluations.reduce((sum, item) => sum + item.overallScore, 0) / evaluations.length) : session.overallScore;
    return (
      <div className="practice-page"><Navbar showBack title="Session complete" />
        <main className="practice-summary">
          <p className="practice-kicker">SESSION COMPLETE</p><h1>You finished the interview.</h1>
          <div className="practice-summary__score"><strong>{average}</strong><span>/100</span><p>Overall answer score</p></div>
          <div className="practice-summary__stats"><div><b>{evaluations.length || session.answers.length}</b><span>Answers practiced</span></div><div><b>{difficulty}</b><span>Difficulty</span></div><div><b>{mode}</b><span>Interview mode</span></div></div>
          <div className="practice-summary__actions"><button onClick={() => navigate(`/interview/${interviewId}`)}>Review interview plan</button><button className="secondary" onClick={() => window.location.reload()}>Practice again</button></div>
        </main>
      </div>
    );
  }

  return (
    <div className="practice-page">
      <Navbar showBack backTo={`/interview/${interviewId}`} title={`${report.title} practice`} />
      <div className="practice-progress"><span style={{ width: `${((currentIndex + (evaluation ? 1 : 0)) / questions.length) * 100}%` }} /></div>
      <main className="practice-room">
        <header className="practice-question-head"><div><p>{currentQuestion.type.toUpperCase()} · {difficulty.toUpperCase()}</p><span>Question {currentIndex + 1} of {questions.length}</span></div><b>{session.overallScore || "—"}<small> current score</small></b></header>
        <section className="practice-question"><h1>{currentQuestion.question}</h1><p>Take a moment to structure your answer. Specific examples make feedback more useful.</p></section>
        {!evaluation ? (
          <section className="practice-composer">
            <textarea value={answer} onChange={(event) => setAnswer(event.target.value)} maxLength={6000} placeholder="Type your answer here, or use the microphone to speak..." aria-label="Your interview answer" />
            <div className="practice-composer__footer"><button className={`practice-mic ${listening ? "active" : ""}`} onClick={toggleSpeech} type="button">{listening ? "Stop listening" : "Use microphone"}</button><span>{answer.length} / 6000</span><button className="practice-submit" onClick={submitAnswer} disabled={submitting}>{submitting ? "Evaluating answer..." : "Get feedback"}</button></div>
          </section>
        ) : (
          <section className="practice-evaluation">
            <div className="practice-evaluation__title"><div><p>ANSWER FEEDBACK</p><h2>{evaluation.overallScore}/100</h2></div><button onClick={goNext} disabled={submitting}>{submitting ? "Saving..." : currentIndex === questions.length - 1 ? "Finish session" : "Next question"}</button></div>
            <div className="practice-rubric">{Object.entries(evaluation.scores).map(([key, value]) => <div key={key}><span>{scoreLabels[key]}</span><b>{value}</b><i><em style={{ width: `${value}%` }} /></i></div>)}</div>
            <div className="practice-feedback-grid"><article className="good"><h3>What worked</h3><ul>{evaluation.strengths.map((item) => <li key={item}>{item}</li>)}</ul></article><article className="improve"><h3>Improve next</h3><ul>{evaluation.improvements.map((item) => <li key={item}>{item}</li>)}</ul></article></div>
            <article className="practice-outline"><h3>Stronger answer outline</h3><p>{evaluation.improvedAnswerOutline}</p></article>
            {evaluation.followUpQuestion && <article className="practice-followup"><span>LIKELY FOLLOW-UP</span><p>{evaluation.followUpQuestion}</p></article>}
          </section>
        )}
      </main>
    </div>
  );
};

export default Practice;
