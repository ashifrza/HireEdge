import React, { useState, useEffect, useRef, useCallback } from 'react'
import '../style/interview.scss'
import { useInterview } from '../hooks/useInterview.js'
import { useNavigate, useParams } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import Navbar from '../../shared/Navbar'

// ── Nav Config ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
    { id: 'technical',  label: 'Technical Questions', icon: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg> },
    { id: 'behavioral', label: 'Behavioral Questions', icon: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
    { id: 'roadmap',    label: 'Road Map', icon: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg> },
]

// ── Interview Timer ───────────────────────────────────────────────────────────
const InterviewTimer = () => {
    const [seconds, setSeconds] = useState(0)
    const [running, setRunning] = useState(false)
    const [preset, setPreset] = useState(null) // countdown seconds
    const intervalRef = useRef(null)

    const PRESETS = [{ label: '15m', val: 900 }, { label: '30m', val: 1800 }, { label: '45m', val: 2700 }, { label: '1h', val: 3600 }]

    useEffect(() => {
        if (running) {
            intervalRef.current = setInterval(() => {
                setSeconds(s => {
                    if (preset !== null) {
                        if (s <= 1) { setRunning(false); toast('⏰ Time is up!', { icon: '⏰' }); return 0 }
                        return s - 1
                    }
                    return s + 1
                })
            }, 1000)
        } else clearInterval(intervalRef.current)
        return () => clearInterval(intervalRef.current)
    }, [running, preset])

    const startPreset = (val) => {
        setPreset(val); setSeconds(val); setRunning(true)
    }
    const toggle = () => setRunning(r => !r)
    const reset = () => { setRunning(false); setSeconds(preset ?? 0); }

    const fmt = (s) => {
        const h = Math.floor(s / 3600)
        const m = Math.floor((s % 3600) / 60)
        const sec = s % 60
        return h > 0 ? `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}` : `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
    }

    const pct = preset ? Math.round((seconds / preset) * 100) : null
    const radius = 28; const circ = 2 * Math.PI * radius

    return (
        <div className='iv-timer'>
            <p className='iv-timer__label'>Interview Timer</p>
            <div className='iv-timer__display'>
                <svg width="72" height="72" viewBox="0 0 72 72" className='iv-timer__ring'>
                    <circle cx="36" cy="36" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5"/>
                    {pct !== null && (
                        <circle cx="36" cy="36" r={radius} fill="none" stroke={pct < 20 ? '#ef4444' : '#ff2d78'} strokeWidth="5"
                            strokeDasharray={circ} strokeDashoffset={circ - (pct / 100) * circ}
                            strokeLinecap="round" transform="rotate(-90 36 36)"
                            style={{ transition: 'stroke-dashoffset 0.9s ease, stroke 0.5s' }}
                        />
                    )}
                </svg>
                <span className='iv-timer__time'>{fmt(seconds)}</span>
            </div>
            <div className='iv-timer__presets'>
                {PRESETS.map(p => (
                    <button key={p.val} className={`iv-timer__preset ${preset === p.val ? 'iv-timer__preset--active' : ''}`}
                        onClick={() => startPreset(p.val)}>{p.label}</button>
                ))}
            </div>
            <div className='iv-timer__controls'>
                <button className='iv-timer__btn' onClick={toggle}>
                    {running ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                    ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    )}
                    {running ? 'Pause' : 'Start'}
                </button>
                <button className='iv-timer__btn iv-timer__btn--ghost' onClick={reset}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v6h6"/><path d="M3 13a9 9 0 1 0 3-7.7L3 8"/></svg>
                </button>
            </div>
        </div>
    )
}

// ── Animated Score Ring ───────────────────────────────────────────────────────
const ScoreRing = ({ score }) => {
    const [animated, setAnimated] = useState(false)
    const r = 38, circ = 2 * Math.PI * r
    const col = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'
    const off = animated ? circ - (score / 100) * circ : circ
    const sub = score >= 80 ? 'Strong match 🎯' : score >= 60 ? 'Good potential ⚡' : 'Needs improvement 📚'

    useEffect(() => { const t = setTimeout(() => setAnimated(true), 400); return () => clearTimeout(t) }, [])

    return (
        <div className='iv-score'>
            <p className='iv-score__lbl'>Match Score</p>
            <div className='iv-score__wrap'>
                <svg width="100" height="100" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="7"/>
                    <circle cx="50" cy="50" r={r} fill="none" stroke={col} strokeWidth="7"
                        strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                        style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.25,0.46,0.45,0.94)', filter: `drop-shadow(0 0 8px ${col}55)` }}
                    />
                </svg>
                <div className='iv-score__inner'>
                    <span className='iv-score__num' style={{ color: col }}>{score}</span>
                    <span className='iv-score__pct'>%</span>
                </div>
            </div>
            <p className='iv-score__sub'>{sub}</p>
        </div>
    )
}

// ── Question Card ─────────────────────────────────────────────────────────────
const QuestionCard = ({ item, index, reviewed, onToggleReview }) => {
    const [open, setOpen] = useState(false)

    const copyToClipboard = async (e) => {
        e.stopPropagation()
        const text = `Q: ${item.question}\n\nIntention: ${item.intention}\n\nModel Answer: ${item.answer}`
        try {
            await navigator.clipboard.writeText(text)
            toast.success('Copied to clipboard!')
        } catch { toast.error('Copy failed') }
    }

    return (
        <motion.div
            className={`iv-qcard ${reviewed ? 'iv-qcard--reviewed' : ''}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.3 }}
        >
            <div className='iv-qcard__header' onClick={() => setOpen(o => !o)}>
                <span className='iv-qcard__idx'>Q{index + 1}</span>
                <p className='iv-qcard__q'>{item.question}</p>
                <div className='iv-qcard__actions' onClick={e => e.stopPropagation()}>
                    <button className='iv-qcard__action-btn' title='Copy question' onClick={copyToClipboard}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    </button>
                    <button
                        className={`iv-qcard__action-btn ${reviewed ? 'iv-qcard__action-btn--done' : ''}`}
                        title={reviewed ? 'Mark as unreviewed' : 'Mark as reviewed'}
                        onClick={() => onToggleReview(index)}
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                    </button>
                </div>
                <motion.span className='iv-qcard__chev' animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.22 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </motion.span>
            </div>
            <AnimatePresence>
                {open && (
                    <motion.div className='iv-qcard__body'
                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28, ease: 'easeInOut' }}
                        style={{ overflow: 'hidden' }}
                    >
                        <div className='iv-qcard__body-inner'>
                            <div className='iv-qcard__section'>
                                <span className='iv-qcard__tag iv-qcard__tag--intent'>Intention</span>
                                <p>{item.intention}</p>
                            </div>
                            <div className='iv-qcard__section'>
                                <span className='iv-qcard__tag iv-qcard__tag--answer'>Model Answer</span>
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
    <motion.div className='iv-day'
        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
    >
        <div className='iv-day__head'>
            <span className='iv-day__badge'>Day {day.day}</span>
            <h3 className='iv-day__focus'>{day.focus}</h3>
        </div>
        <ul className='iv-day__tasks'>
            {day.tasks.map((t, i) => <li key={i}><span className='iv-day__dot'/>{t}</li>)}
        </ul>
    </motion.div>
)

// ── Download Button ───────────────────────────────────────────────────────────
const DownloadBtn = ({ interviewId, getResumePdf }) => {
    const [loading, setLoading] = useState(false)
    const onClick = async () => {
        if (loading) return
        setLoading(true)
        const t = toast.loading('Generating your ATS resume...')
        try {
            await getResumePdf(interviewId)
            toast.dismiss(t); toast.success('Resume downloaded!')
        } catch { toast.dismiss(t); toast.error('Download failed. Try again.') }
        finally { setLoading(false) }
    }

    return (
        <button className={`iv-dl-btn ${loading ? 'iv-dl-btn--loading' : ''}`} onClick={onClick} disabled={loading}>
            {loading ? (
                <><svg className='spin' width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 2a10 10 0 0 1 10 10"/></svg> Generating...</>
            ) : (
                <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download Resume PDF</>
            )}
        </button>
    )
}

// ── Share Report Button ───────────────────────────────────────────────────────
const ShareBtn = () => {
    const onClick = async () => {
        const url = window.location.href
        try {
            await navigator.clipboard.writeText(url)
            toast.success('Report link copied to clipboard!')
        } catch {
            toast.error('Could not copy link')
        }
    }
    return (
        <button className='iv-share-btn' onClick={onClick} title='Copy share link'>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            Share
        </button>
    )
}

// ── Loading ───────────────────────────────────────────────────────────────────
const LoadingScreen = () => (
    <div className='he-loading'>
        <div className='he-loading__ring'/>
        <p className='he-loading__text'>Loading your interview plan...</p>
    </div>
)

// ── Section transition ────────────────────────────────────────────────────────
const sv = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.28 } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.18 } }
}

// ── Main Component ─────────────────────────────────────────────────────────────
const Interview = () => {
    const [activeNav, setActiveNav] = useState('technical')
    const { report, loading, getResumePdf } = useInterview()
    const { interviewId } = useParams()

    // Progress Tracker
    const [reviewed, setReviewed] = useState({ technical: {}, behavioral: {} })
    const toggleReview = (section, index) => {
        setReviewed(prev => ({
            ...prev,
            [section]: { ...prev[section], [index]: !prev[section][index] }
        }))
    }

    if (loading || !report) return <LoadingScreen />

    // Progress counts
    const techTotal = report.technicalQuestions.length
    const techDone = Object.values(reviewed.technical).filter(Boolean).length
    const behTotal = report.behavioralQuestions.length
    const behDone = Object.values(reviewed.behavioral).filter(Boolean).length
    const totalDone = techDone + behDone
    const totalQ = techTotal + behTotal
    const progressPct = totalQ ? Math.round((totalDone / totalQ) * 100) : 0

    return (
        <div className='iv-page'>
            <Navbar showBack backTo='/' title={report.title} />

            {/* ── Overall Progress Bar ── */}
            <div className='iv-progress-bar'>
                <div className='iv-progress-bar__inner' style={{ width: `${progressPct}%` }}/>
            </div>

            <div className='iv-layout'>
                {/* ── Left Sidebar ── */}
                <aside className='iv-sidebar iv-sidebar--left'>
                    <div className='iv-sidebar__inner'>
                        <p className='iv-sidebar__section-lbl'>Sections</p>

                        {NAV_ITEMS.map(item => {
                            const count = item.id === 'technical' ? `${techDone}/${techTotal}`
                                : item.id === 'behavioral' ? `${behDone}/${behTotal}` : null
                            return (
                                <button
                                    key={item.id}
                                    className={`iv-nav-item ${activeNav === item.id ? 'iv-nav-item--active' : ''}`}
                                    onClick={() => setActiveNav(item.id)}
                                >
                                    <span className='iv-nav-item__icon'>{item.icon}</span>
                                    <span className='iv-nav-item__label'>{item.label}</span>
                                    {count && <span className='iv-nav-item__count'>{count}</span>}
                                    {activeNav === item.id && <motion.span className='iv-nav-item__bar' layoutId='navBar' transition={{ type: 'spring', stiffness: 320, damping: 32 }}/>}
                                </button>
                            )
                        })}

                        <div className='iv-sidebar__divider'/>

                        <div className='iv-overall-progress'>
                            <div className='iv-overall-progress__top'>
                                <span>Progress</span>
                                <span>{progressPct}%</span>
                            </div>
                            <div className='iv-overall-progress__bar'>
                                <motion.div className='iv-overall-progress__fill'
                                    animate={{ width: `${progressPct}%` }}
                                    transition={{ duration: 0.6, ease: 'easeOut' }}
                                />
                            </div>
                            <span>{totalDone} of {totalQ} questions reviewed</span>
                        </div>
                    </div>

                    <div className='iv-sidebar__actions'>
                        <DownloadBtn interviewId={interviewId} getResumePdf={getResumePdf} />
                        <ShareBtn />
                    </div>
                </aside>

                {/* ── Main Content ── */}
                <main className='iv-content'>
                    <AnimatePresence mode='wait'>
                        {activeNav === 'technical' && (
                            <motion.section key='tech' variants={sv} initial='hidden' animate='show' exit='exit'>
                                <div className='iv-content-head'>
                                    <div>
                                        <h2>Technical Questions</h2>
                                        <p>Click each question to reveal the intention and model answer</p>
                                    </div>
                                    <span className='iv-content-count'>{techTotal} questions</span>
                                </div>
                                <div className='iv-qlist'>
                                    {report.technicalQuestions.map((q, i) => (
                                        <QuestionCard key={i} item={q} index={i}
                                            reviewed={!!reviewed.technical[i]}
                                            onToggleReview={(idx) => toggleReview('technical', idx)}
                                        />
                                    ))}
                                </div>
                            </motion.section>
                        )}

                        {activeNav === 'behavioral' && (
                            <motion.section key='beh' variants={sv} initial='hidden' animate='show' exit='exit'>
                                <div className='iv-content-head'>
                                    <div>
                                        <h2>Behavioral Questions</h2>
                                        <p>STAR method — Situation, Task, Action, Result</p>
                                    </div>
                                    <span className='iv-content-count'>{behTotal} questions</span>
                                </div>
                                <div className='iv-qlist'>
                                    {report.behavioralQuestions.map((q, i) => (
                                        <QuestionCard key={i} item={q} index={i}
                                            reviewed={!!reviewed.behavioral[i]}
                                            onToggleReview={(idx) => toggleReview('behavioral', idx)}
                                        />
                                    ))}
                                </div>
                            </motion.section>
                        )}

                        {activeNav === 'roadmap' && (
                            <motion.section key='road' variants={sv} initial='hidden' animate='show' exit='exit'>
                                <div className='iv-content-head'>
                                    <div>
                                        <h2>Preparation Road Map</h2>
                                        <p>Follow this daily plan to maximize your chances</p>
                                    </div>
                                    <span className='iv-content-count'>{report.preparationPlan.length}-day plan</span>
                                </div>
                                <div className='iv-roadmap'>
                                    {report.preparationPlan.map((day, i) => (
                                        <RoadMapDay key={day.day} day={day} index={i}/>
                                    ))}
                                </div>
                            </motion.section>
                        )}
                    </AnimatePresence>
                </main>

                {/* ── Right Sidebar ── */}
                <aside className='iv-sidebar iv-sidebar--right'>
                    <div className='iv-sidebar__inner'>
                        <ScoreRing score={report.matchScore}/>
                        <div className='iv-sidebar__divider'/>
                        <InterviewTimer/>
                        <div className='iv-sidebar__divider'/>

                        <div className='iv-skill-gaps'>
                            <p className='iv-skill-gaps__lbl'>Skill Gaps</p>
                            <div className='iv-skill-gaps__list'>
                                {report.skillGaps.map((g, i) => (
                                    <motion.span key={i} className={`iv-skill-tag iv-skill-tag--${g.severity}`}
                                        initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                    >
                                        {g.skill}
                                    </motion.span>
                                ))}
                            </div>
                        </div>

                        <div className='iv-sidebar__divider'/>
                        <div className='iv-report-info'>
                            <p className='iv-report-info__lbl'>Report</p>
                            <p className='iv-report-info__title'>{report.title}</p>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    )
}

export default Interview