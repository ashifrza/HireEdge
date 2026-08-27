import { Link } from "react-router";
import "./landing.scss";

const features = [
  ["01", "Role-fit analysis", "See matched strengths, missing keywords, and the reason behind your score."],
  ["02", "Real answer practice", "Answer role-specific questions and get a measurable coaching rubric."],
  ["03", "Progress that compounds", "Track communication, evidence, structure, relevance, and accuracy over time."],
];

const Landing = () => (
  <main className="landing">
    <nav className="landing-nav" aria-label="Primary navigation">
      <Link className="landing-brand" to="/">Hire<span>Edge</span></Link>
      <div className="landing-nav__actions">
        <Link className="landing-link" to="/login">Sign in</Link>
        <Link className="landing-button landing-button--small" to="/register">Start free</Link>
      </div>
    </nav>
    <section className="landing-hero">
      <div className="landing-hero__copy">
        <p className="landing-kicker"><span /> Built for the interview, not the application pile</p>
        <h1>Practice the answers that get you <em>hired.</em></h1>
        <p className="landing-hero__lead">Turn any resume and job description into a personal interview plan, then practice with AI feedback that shows exactly what to improve.</p>
        <div className="landing-hero__actions">
          <Link className="landing-button" to="/register">Build my interview plan</Link>
          <a className="landing-text-button" href="#how-it-works">See how it works</a>
        </div>
        <div className="landing-proof"><span>No credit card</span><span>Private by default</span><span>Role-specific coaching</span></div>
      </div>
      <div className="landing-preview" aria-label="HireEdge product preview">
        <div className="landing-preview__top"><span /><span /><span /><b>Frontend Engineer · Practice</b></div>
        <div className="landing-preview__body">
          <p className="landing-preview__eyebrow">QUESTION 3 OF 8</p>
          <h2>How would you reduce rendering work in a complex React dashboard?</h2>
          <div className="landing-answer">I would begin by profiling the interaction to identify which components are rendering and why...</div>
          <div className="landing-score-row"><div><strong>84</strong><small>Overall</small></div><div><strong>91</strong><small>Relevance</small></div><div><strong>78</strong><small>Evidence</small></div></div>
          <div className="landing-feedback"><b>Strong direction</b><p>You started with measurement and named a concrete tool. Add one result from a real project.</p></div>
        </div>
      </div>
    </section>
    <section className="landing-features" id="how-it-works">
      <div className="landing-section-title"><p>HOW IT WORKS</p><h2>A focused loop from job description to better answers.</h2></div>
      <div className="landing-feature-grid">
        {features.map(([number, title, body]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{body}</p></article>)}
      </div>
    </section>
    <section className="landing-cta"><p>YOUR NEXT INTERVIEW STARTS HERE</p><h2>Stop guessing. Start practicing.</h2><Link className="landing-button" to="/register">Create your free plan</Link></section>
  </main>
);

export default Landing;
