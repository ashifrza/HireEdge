import { Link } from 'react-router'
import { motion } from 'framer-motion'
import Brand from '../../shared/Brand'

const AuthShell = ({ children, eyebrow, title, description }) => (
  <main className='auth-page'>
    <div className='auth-bg'/>
    <section className='auth-showcase' aria-label='HireEdge benefits'>
      <Link to='/' className='auth-showcase__brand'><Brand /></Link>
      <div className='auth-showcase__copy'>
        <span className='auth-showcase__eyebrow'>YOUR HIREEDGE WORKSPACE</span>
        <h2>Pick up where<br/><em>you left off.</em></h2>
        <p>Your tailored resumes, role reviews, and interview practice stay together—one application at a time.</p>
      </div>
      <div className='auth-kit'>
        <div className='auth-kit__top'><span>Application kit</span><b>Ready</b></div>
        <div className='auth-kit__item'><span>01</span><div><strong>One-page ATS resume</strong><small>Tailored, truthful, downloadable</small></div><b>✓</b></div>
        <div className='auth-kit__item'><span>02</span><div><strong>Role-fit analysis</strong><small>Strengths, keywords, gaps</small></div><b>87%</b></div>
        <div className='auth-kit__item'><span>03</span><div><strong>Interview strategy</strong><small>Questions and 7-day roadmap</small></div><b>8 Qs</b></div>
      </div>
      <p className='auth-showcase__foot'>Private by default&nbsp;&nbsp;·&nbsp;&nbsp;No credit card</p>
    </section>
    <motion.section className='auth-card' initial={{opacity:0,y:24,scale:.98}} animate={{opacity:1,y:0,scale:1}} transition={{duration:.48,ease:[.22,.8,.24,1]}}>
      <Link to='/' className='auth-card__mobile-brand'><Brand compact /></Link>
      <div className='auth-card__header'><span>{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>
      {children}
      <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '.8rem', lineHeight: 1.6 }}>Read how HireEdge handles your information in our <a href='/privacy/' style={{ textDecoration: 'underline' }}>Privacy Policy</a>.</p>
    </motion.section>
  </main>
)

export default AuthShell
