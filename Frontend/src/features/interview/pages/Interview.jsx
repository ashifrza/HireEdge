import React, { useState, useEffect } from 'react'
import '../style/interview.scss'
import { useInterview } from '../hooks/useInterview.js'
import { useAuth } from '../../auth/hooks/useAuth'
import { useNavigate, useParams } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

// ── Navigation Items ───────────────────────────────────────────────────────────
const NAV_ITEMS = [
    {
        id: 'technical', label: 'Technical Questions',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
    },
    {
        id: 'behavioral', label: 'Behavioral Questions',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    },
    {
        id: 'roadmap', label: 'Road Map',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
    },
]

// ── Animated SVG Score Ring ────────────────────────────────────────────────────
const ScoreRing = ({ score }) => {
    const [animated, setAnimated] = useState(false)
    const radius = 38
    const circumference = 2 * Math.PI * radius
    const color = score >= 80 ? '#3fb950' : score >= 60 ? '#f5a623' : '#ff4d4d'
    const offset = animated ? circumference - (score / 100) * circumference : circumference

    useEffect(() => {
        const t = setTimeout(() => setAnimated(true), 300)
        return () => clearTimeout(t)
    }, [])

    const sub = score >= 80 ? 'Strong match 🎯' : score >= 60 ? 'Good potential ⚡' : 'Needs work 📚'

    return (
        <div className='score-ring'>
            <p className='score-ring__label'>Match Score</p>
            <div className='score-ring__wrap'>
                <svg width="100" height="100" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="7"/>
                    <circle
                        cx="50" cy="50" r={radius}
                        fill="none" stroke={color} strokeWidth="7"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                        style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.25,0.46,0.45,0.94)', filter: `drop-shadow(0 0 6px ${color}66)` }}
                    />
                </svg>
                <div className='score-ring__inner'>
                    <span className='score-ring__value' style={{ color }}>{score}</span>
                    <span className='score-ring__pct'>%</span>
                </div>
            </div>
            <p className='score-ring__sub'>{sub}</p>
        </div>
    )
}

// ── Question Card (accordion) ─────────────────────────────────────────────────
const QuestionCard = ({ item, index }) => {
    const [open, setOpen] = useState(false)
    return (
        <motion.div
            className='q-card'
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.3 }}
        >
            <div className='q-card__header' onClick={() => setOpen(o => !o)}>
                <span className='q-card__index'>Q{index + 1}</span>
                <p className='q-card__question'>{item.question}</p>
                <motion.span
                    className='q-card__chevron'
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9"/>
                    </svg>
                </motion.span>
            </div>
            <AnimatePresence>
                {open && (
                    <motion.div
                        className='q-card__body'
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        style={{ overflow: 'hidden' }}
                    >
                        <div className='q-card__body-inner'>
                            <div className='q-card__section'>
                                <span className='q-card__tag q-card__tag--intention'>Intention</span>
                                <p>{item.intention}</p>
                            </div>
                            <div className='q-card__section'>
                                <span className='q-card__tag q-card__tag--answer'>Model Answer</span>
                                <p>{item.answer}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

// ── Road Map Day ──────────────────────────────────────────────────────────────
const RoadMapDay = ({ day, index }) => (
    <motion.div
        className='roadmap-day'
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.06, duration: 0.3 }}
    >
        <div className='roadmap-day__header'>
            <span className='roadmap-day__badge'>Day {day.day}</span>
            <h3 className='roadmap-day__focus'>{day.focus}</h3>
        </div>
        <ul className='roadmap-day__tasks'>
            {day.tasks.map((task, i) => (
                <li key={i}>
                    <span className='roadmap-day__bullet'/>
                    {task}
                </li>
            ))}
        </ul>
    </motion.div>
)

// ── Download Button ───────────────────────────────────────────────────────────
const DownloadButton = ({ interviewId, getResumePdf }) => {
    const [downloading, setDownloading] = useState(false)

    const handleDownload = async () => {
        if (downloading) return
        setDownloading(true)
        try {
            await getResumePdf(interviewId)
            toast.success('Resume downloaded!')
        } catch {
            toast.error('Download failed. Try again.')
        } finally {
            setDownloading(false)
        }
    }

    return (
        <button className={`download-btn ${downloading ? 'download-btn--loading' : ''}`} onClick={handleDownload} disabled={downloading}>
            {downloading ? (
                <>
                    <svg className='download-btn__spinner' width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M12 2a10 10 0 0 1 10 10"/>
                    </svg>
                    Generating PDF...
                </>
            ) : (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Download Resume PDF
                </>
            )}
        </button>
    )
}

// ── Loading Screen ─────────────────────────────────────────────────────────────
const LoadingScreen = () => (
    <main className='loading-screen'>
        <div className='loading-ring'>
            <svg viewBox="0 0 50 50" width="48" height="48">
                <circle cx="25" cy="25" r="20" fill="none" stroke="rgba(255,45,120,0.12)" strokeWidth="4"/>
                <circle cx="25" cy="25" r="20" fill="none" stroke="#ff2d78" strokeWidth="4"
                    strokeDasharray="60 75" strokeLinecap="round" className='loading-ring__arc'/>
            </svg>
        </div>
        <p className='loading-screen__text'>Loading your interview plan...</p>
    </main>
)

// ── Section Animation ─────────────────────────────────────────────────────────
const sectionVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.2 } }
}

// ── Main Component ─────────────────────────────────────────────────────────────
const Interview = () => {
    const [activeNav, setActiveNav] = useState('technical')
    const { report, loading, getResumePdf } = useInterview()
    const { handleLogout } = useAuth()
    const { interviewId } = useParams()
    const navigate = useNavigate()

    const handleLogoutClick = async () => {
        await handleLogout()
        navigate('/login')
    }

    if (loading || !report) return <LoadingScreen />

    return (
        <div className='interview-page'>
            <div className='interview-layout'>

                {/* ── Left Nav ── */}
                <nav className='interview-nav'>
                    <div className='nav-top'>
                        {/* Brand + back */}
                        <button className='nav-back' onClick={() => navigate('/')}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6"/>
                            </svg>
                            Back
                        </button>

                        <div className='nav-brand'>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
                            </svg>
                            HireEdge
                        </div>

                        <p className='nav-section-label'>Sections</p>
                        {NAV_ITEMS.map(item => (
                            <button
                                key={item.id}
                                className={`interview-nav__item ${activeNav === item.id ? 'interview-nav__item--active' : ''}`}
                                onClick={() => setActiveNav(item.id)}
                            >
                                <span className='interview-nav__icon'>{item.icon}</span>
                                {item.label}
                                {activeNav === item.id && (
                                    <motion.span
                                        className='nav-active-bar'
                                        layoutId='activeBar'
                                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className='nav-bottom'>
                        <DownloadButton interviewId={interviewId} getResumePdf={getResumePdf} />
                        <button className='nav-logout' onClick={handleLogoutClick}>Logout</button>
                    </div>
                </nav>

                <div className='interview-divider'/>

                {/* ── Center Content ── */}
                <main className='interview-content'>
                    <AnimatePresence mode='wait'>
                        {activeNav === 'technical' && (
                            <motion.section key='technical' variants={sectionVariants} initial='hidden' animate='show' exit='exit'>
                                <div className='content-header'>
                                    <h2>Technical Questions</h2>
                                    <span className='content-header__count'>{report.technicalQuestions.length} questions</span>
                                </div>
                                <div className='q-list'>
                                    {report.technicalQuestions.map((q, i) => (
                                        <QuestionCard key={i} item={q} index={i}/>
                                    ))}
                                </div>
                            </motion.section>
                        )}

                        {activeNav === 'behavioral' && (
                            <motion.section key='behavioral' variants={sectionVariants} initial='hidden' animate='show' exit='exit'>
                                <div className='content-header'>
                                    <h2>Behavioral Questions</h2>
                                    <span className='content-header__count'>{report.behavioralQuestions.length} questions</span>
                                </div>
                                <div className='q-list'>
                                    {report.behavioralQuestions.map((q, i) => (
                                        <QuestionCard key={i} item={q} index={i}/>
                                    ))}
                                </div>
                            </motion.section>
                        )}

                        {activeNav === 'roadmap' && (
                            <motion.section key='roadmap' variants={sectionVariants} initial='hidden' animate='show' exit='exit'>
                                <div className='content-header'>
                                    <h2>Preparation Road Map</h2>
                                    <span className='content-header__count'>{report.preparationPlan.length}-day plan</span>
                                </div>
                                <div className='roadmap-list'>
                                    {report.preparationPlan.map((day, i) => (
                                        <RoadMapDay key={day.day} day={day} index={i}/>
                                    ))}
                                </div>
                            </motion.section>
                        )}
                    </AnimatePresence>
                </main>

                <div className='interview-divider'/>

                {/* ── Right Sidebar ── */}
                <aside className='interview-sidebar'>
                    <ScoreRing score={report.matchScore}/>

                    <div className='sidebar-divider'/>

                    <div className='skill-gaps'>
                        <p className='skill-gaps__label'>Skill Gaps</p>
                        <div className='skill-gaps__list'>
                            {report.skillGaps.map((gap, i) => (
                                <motion.span
                                    key={i}
                                    className={`skill-tag skill-tag--${gap.severity}`}
                                    initial={{ opacity: 0, scale: 0.85 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    {gap.skill}
                                </motion.span>
                            ))}
                        </div>
                    </div>

                    <div className='sidebar-divider'/>

                    <div className='report-meta'>
                        <p className='report-meta__label'>Report</p>
                        <p className='report-meta__title'>{report.title}</p>
                    </div>
                </aside>
            </div>
        </div>
    )
}

export default Interview