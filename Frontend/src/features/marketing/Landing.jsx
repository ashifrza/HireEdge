import { Link } from 'react-router'
import Brand from '../shared/Brand'
import './landing.scss'

const Arrow = () => (
  <svg viewBox='0 0 20 20' aria-hidden='true'><path d='M4 10h11M11 6l4 4-4 4' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'/></svg>
)

const steps = [
  ['01', 'Add the role', 'Paste the job description so HireEdge understands exactly what the company is hiring for.'],
  ['02', 'Bring your resume', 'Upload your PDF. We compare your real experience with the role—without inventing qualifications.'],
  ['03', 'Leave interview-ready', 'Download a one-page ATS resume and practice the questions most likely to decide the interview.'],
]

const Landing = () => (
  <main className='landing'>
    <div className='landing-ambient landing-ambient--one'/><div className='landing-ambient landing-ambient--two'/>
    <nav className='landing-nav' aria-label='Primary navigation'>
      <Link className='landing-brand' to='/' aria-label='HireEdge home'><Brand /></Link>
      <div className='landing-nav__center'><a href='#how-it-works'>The process</a><a href='#outcomes'>Inside your report</a></div>
      <div className='landing-nav__actions'><Link className='landing-link' to='/login'>Sign in</Link><Link className='landing-button landing-button--small' to='/register'>Start free <Arrow /></Link></div>
    </nav>

    <section className='landing-hero'>
      <div className='landing-hero__copy'>
        <p className='landing-kicker'><span>HireEdge</span> Built for one job application at a time.</p>
        <h1>A better resume for the job you <em>actually want.</em></h1>
        <p className='landing-hero__lead'>Add the job description and your current resume. HireEdge helps you make honest, useful improvements—then prepares you for the interview that follows.</p>
        <div className='landing-hero__actions'><Link className='landing-button landing-button--hero' to='/register'>Improve my resume <Arrow /></Link><a className='landing-text-button' href='#how-it-works'><span className='landing-play'>▶</span> See how it works</a></div>
        <div className='landing-proof' aria-label='Product assurances'><span><b>01</b> Truthful rewriting</span><span><b>02</b> ATS-safe PDF</span><span><b>03</b> Private workspace</span></div>
      </div>

      <div className='landing-stage' aria-label='HireEdge application kit preview'>
        <div className='landing-stage__halo'/>
        <div className='landing-resume-card'>
          <div className='landing-resume-card__top'><span className='landing-resume-card__avatar'>AR</span><div><strong>Alex Rivera</strong><small>Frontend Engineer</small></div><span className='landing-resume-card__tag'>1 page</span></div>
          <div className='landing-resume-card__contact'>alex@email.com&nbsp;&nbsp; • &nbsp;&nbsp;New York&nbsp;&nbsp; • &nbsp;&nbsp;Portfolio</div>
          <div className='landing-resume-card__section'><b>SUMMARY</b><span/><span className='short'/></div>
          <div className='landing-resume-card__section'><b>EXPERIENCE</b><span/><span/><span className='mid'/></div>
          <div className='landing-resume-card__section'><b>PROJECTS</b><span/><span className='short'/></div>
          <div className='landing-resume-card__footer'><span>ATS-ready</span><strong>PDF</strong></div>
        </div>
        <div className='landing-score-card'><div className='landing-score-card__ring'><strong>87</strong><span>%</span></div><div><small>ROLE MATCH</small><strong>Strong fit</strong><span>+18 after tailoring</span></div></div>
        <div className='landing-keyword-card'><span>✓</span><div><strong>12 keywords aligned</strong><small>React · TypeScript · REST APIs</small></div></div>
        <div className='landing-plan-card'><small>YOUR INTERVIEW PLAN</small><div><span>01</span><p>Technical questions</p><b>5</b></div><div><span>02</span><p>Behavioral stories</p><b>3</b></div><div><span>03</span><p>Skill-gap roadmap</p><b>7d</b></div></div>
      </div>
    </section>

    <section className='landing-trust'><span>Built for focused applicants</span><p>RESUME TAILORING</p><i/><p>ATS FORMATTING</p><i/><p>INTERVIEW PRACTICE</p><i/><p>SKILL-GAP PLANNING</p></section>

    <section className='landing-process' id='how-it-works'>
      <div className='landing-section-title'><p>THREE SIMPLE STEPS</p><h2>From job post<br/>to <span>ready to apply.</span></h2><div>No complicated builder. Start with the role and the experience you already have.</div></div>
      <div className='landing-step-list'>{steps.map(([number,title,body])=><article key={number}><span>{number}</span><div><h3>{title}</h3><p>{body}</p></div><b>↗</b></article>)}</div>
    </section>

    <section className='landing-outcomes' id='outcomes'>
      <div className='landing-outcomes__head'><p>WHAT YOU GET</p><h2>Everything you need before<br/>you click <span>Apply.</span></h2></div>
      <div className='landing-bento'>
        <article className='landing-bento__resume'><span className='landing-bento__icon'>⌁</span><small>APPLICATION</small><h3>A one-page resume recruiters can actually scan.</h3><p>Single column, standard headings, selectable text, role-aligned keywords, and no fake claims.</p><div className='landing-mini-page'><i/><i/><i/><i/><i/></div></article>
        <article><span className='landing-bento__icon'>◎</span><small>ROLE FIT</small><h3>Know why you match.</h3><p>See supported strengths, missing keywords, and an evidence-based score.</p><div className='landing-meter'><span style={{width:'87%'}}/></div></article>
        <article><span className='landing-bento__icon'>◫</span><small>PRACTICE</small><h3>Prepare the right answers.</h3><p>Technical and behavioral questions generated for the role—not generic lists.</p><div className='landing-pills'><span>React</span><span>System design</span><span>STAR</span></div></article>
        <article className='landing-bento__wide'><div><span className='landing-bento__icon'>↗</span><small>IMPROVEMENT</small><h3>A seven-day roadmap from gaps to confidence.</h3><p>Turn missing skills into a practical sequence of tasks, then track every completed step.</p></div><div className='landing-week'>{[1,2,3,4,5,6,7].map(day=><span key={day} className={day<5?'done':''}>{day<5?'✓':day}</span>)}</div></article>
      </div>
    </section>

    <section className='landing-cta'><div className='landing-cta__orb'/><p>READY WHEN YOU ARE</p><h2>Bring the job post.<br/>Leave with a <span>better application.</span></h2><Link className='landing-button landing-button--hero' to='/register'>Start with my resume <Arrow /></Link><small>No credit card · Your data stays private</small></section>
    <footer className='landing-footer'><Brand compact/><p>© {new Date().getFullYear()} HireEdge. Built for better interviews.</p><div><Link to='/login'>Sign in</Link><a href='/privacy/'>Privacy Policy</a><a href='#how-it-works'>How it works</a></div></footer>
  </main>
)

export default Landing
