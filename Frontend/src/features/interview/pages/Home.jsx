import React, { useEffect, useState, useRef } from 'react'
import '../style/home.scss'
import { useInterview } from '../hooks/useInterview.js'
import { useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import Navbar from '../../shared/Navbar'
import Brand from '../../shared/Brand'
import { getInterviewProgress } from '../services/interview.api.js'

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] } })
}

const LoadingScreen = () => (
    <div className='he-loading'>
        <div className='he-loading__ring'/>
        <p className='he-loading__text'>AI is crafting your personalized strategy<span className='he-dots'><span/><span/><span/></span></p>
    </div>
)

const Home = () => {
    const { loading, generateReport, reports, deleteReport } = useInterview()
    const [jobDescription, setJobDescription] = useState('')
    const [selfDescription, setSelfDescription] = useState('')
    const [fileName, setFileName] = useState('')
    const [isDragging, setIsDragging] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const [deletingId, setDeletingId] = useState(null)
    const [progress, setProgress] = useState(null)
    const resumeInputRef = useRef()
    const navigate = useNavigate()

    useEffect(() => {
        getInterviewProgress().then((data) => setProgress(data.progress)).catch(() => setProgress(null))
    }, [])

    const handleFileChange = (e) => {
        const f = e.target.files[0]
        if (f) setFileName(f.name)
    }

    const handleDrop = (e) => {
        e.preventDefault(); setIsDragging(false)
        const f = e.dataTransfer.files[0]
        if (f && (f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'))) {
            const dt = new DataTransfer(); dt.items.add(f)
            resumeInputRef.current.files = dt.files; setFileName(f.name)
        } else { toast.error('Please upload a PDF resume') }
    }

    const handleGenerate = async () => {
        if (!jobDescription.trim()) { toast.error('Job description is required'); return }
        if (!resumeInputRef.current?.files[0] && !selfDescription.trim()) {
            toast.error('Upload a resume or add a self-description'); return
        }
        const resumeFile = resumeInputRef.current?.files[0]
        const t = toast.loading('AI is analyzing your profile...')
        setIsGenerating(true)
        try {
            const data = await generateReport({ jobDescription, selfDescription, resumeFile })
            toast.dismiss(t); toast.success('Interview strategy ready!')
            navigate(`/interview/${data._id}`)
        } catch (error) {
            toast.dismiss(t); toast.error(error.message)
        } finally {
            setIsGenerating(false)
        }
    }

    const handleDelete = async (e, id) => {
        e.stopPropagation()
        if (!window.confirm('Delete this report permanently?')) return
        setDeletingId(id)
        try { await deleteReport(id); toast.success('Report deleted') }
        catch { toast.error('Failed to delete') }
        finally { setDeletingId(null) }
    }

    const scoreClass = (s) => s >= 80 ? 'high' : s >= 60 ? 'mid' : 'low'

    if (loading) return <LoadingScreen />

    return (
        <div className='he-home' id='dashboard-top'>
            <Navbar />

            {/* ── Hero ── */}
            <section className='he-hero'>
                <motion.div className='he-hero__inner' initial='hidden' animate='show' variants={{ show: { transition: { staggerChildren: 0.09 } } }}>
                    <div className='he-hero__copy'>
                        <motion.h1 variants={fadeUp} custom={1}>Let’s work on your<br/>next <em>application.</em></motion.h1>
                        <motion.p className='he-hero__sub' variants={fadeUp} custom={2}>Add the role you are applying for and the resume you use today. We’ll show you what already works, what needs attention, and what to practise before the interview.</motion.p>
                        <motion.div className='he-hero__steps' variants={fadeUp} custom={3}>
                            <span><b>01</b> Add the role</span><i/><span><b>02</b> Add your resume</span><i/><span><b>03</b> Review the results</span>
                        </motion.div>
                    </div>
                    <motion.aside className='he-hero-visual' variants={fadeUp} custom={2} aria-label='Application kit output preview'>
                        <div className='he-hero-visual__bar'><span/><span/><span/><b>HireEdge analysis</b></div>
                        <div className='he-hero-visual__body'>
                            <div className='he-hero-visual__score'><span>87<small>%</small></span><div><b>Strong role match</b><p>12 supported keywords aligned</p></div></div>
                            <div className='he-hero-visual__outputs'><span>One-page ATS resume <b>PDF</b></span><span>Interview questions <b>8</b></span><span>Improvement roadmap <b>7d</b></span></div>
                            <div className='he-hero-visual__ready'><span>✓</span><div><b>Your application kit is ready</b><small>Built only from your real experience</small></div></div>
                        </div>
                    </motion.aside>
                </motion.div>
            </section>

            <section className='he-overview' aria-label='Practice progress'>
                <div><span>Plans created</span><strong>{reports.length}</strong><small>Targeted roles</small></div>
                <div><span>Practice sessions</span><strong>{progress?.totalSessions || 0}</strong><small>{progress?.completedSessions || 0} completed</small></div>
                <div><span>Answers practiced</span><strong>{progress?.answersPracticed || 0}</strong><small>Across all roles</small></div>
                <div><span>Average score</span><strong>{progress?.averageScore || '—'}{progress?.averageScore ? '%' : ''}</strong><small>AI coaching rubric</small></div>
            </section>

            {/* ── Input Section ── */}
            <section className='he-form-section' id='new-application'>
                <div className='he-form-intro'><span>NEW APPLICATION</span><h2>Start with the job you want.</h2><p>Use the full job description for a more useful resume review and better practice questions.</p></div>
                <motion.div className='he-form-card' initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.4 }}>

                    {/* Left */}
                    <div className='he-panel he-panel--left'>
                        <div className='he-panel__head'>
                            <span className='he-panel__icon'>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                            </span>
                            <h2>Target Job Description</h2>
                            <span className='he-badge he-badge--red'>Required</span>
                        </div>
                        <textarea
                            className='he-textarea'
                            onChange={(e) => setJobDescription(e.target.value)}
                            placeholder={'Paste the full job description here...\n\ne.g. "Senior Frontend Engineer at Google — requires React, TypeScript, system design..."'}
                            maxLength={5000}
                        />
                        <span className='he-charcount' style={{ color: jobDescription.length > 4500 ? '#f59e0b' : undefined }}>
                            {jobDescription.length} / 5000
                        </span>
                    </div>

                    <div className='he-vdivider'/>

                    {/* Right */}
                    <div className='he-panel he-panel--right'>
                        <div className='he-panel__head'>
                            <span className='he-panel__icon'>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                            </span>
                            <h2>Your Profile</h2>
                        </div>

                        <label className='he-field-label'>Upload Resume <span className='he-badge he-badge--green'>Best Results</span></label>
                        <label
                            className={`he-dropzone${fileName ? ' he-dropzone--filled' : ''}${isDragging ? ' he-dropzone--drag' : ''}`}
                            htmlFor='he-resume'
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                        >
                            {fileName ? (
                                <>
                                    <span className='he-dropzone__file-ico'>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                                    </span>
                                    <p className='he-dropzone__name'>{fileName}</p>
                                    <p className='he-dropzone__sub'>Click to replace</p>
                                </>
                            ) : (
                                <>
                                    <span className='he-dropzone__ico'>
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>
                                    </span>
                                    <p className='he-dropzone__name'>Click to upload or drag & drop</p>
                                    <p className='he-dropzone__sub'>PDF · Max 3MB</p>
                                </>
                            )}
                            <input ref={resumeInputRef} hidden type='file' id='he-resume' accept='.pdf,application/pdf' onChange={handleFileChange}/>
                        </label>

                        <div className='he-or-div'><span>or</span></div>

                        <label className='he-field-label' htmlFor='he-self'>Quick Self-Description</label>
                        <textarea
                            className='he-textarea he-textarea--sm'
                            id='he-self'
                            onChange={(e) => setSelfDescription(e.target.value)}
                            placeholder="Describe your experience, key skills, and years of experience..."
                        />

                        <div className='he-info-row'>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="#4a90e2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12" stroke="#fff" strokeWidth="2.5"/><circle cx="12" cy="16" r="1" fill="#fff"/></svg>
                            Resume <strong>or</strong> Self-Description is required
                        </div>
                    </div>
                </motion.div>

                <motion.div className='he-action-row' initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                    <span className='he-action-hint'>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="#ff2d78"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
                        {isGenerating ? 'Trying the fastest available AI provider…' : 'AI analysis · Usually under 30 seconds'}
                    </span>
                    <button className='he-gen-btn' onClick={handleGenerate} disabled={isGenerating}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
                        {isGenerating ? 'Generating Strategy…' : 'Generate My Interview Strategy'}
                    </button>
                </motion.div>
            </section>

            {/* ── Reports Grid ── */}
            {reports.length > 0 && (
                <section className='he-reports' id='my-plans'>
                    <div className='he-reports__hd'>
                        <div>
                            <h2>My Interview Plans</h2>
                            <p>{reports.length} plan{reports.length !== 1 ? 's' : ''} · Click to view full strategy</p>
                        </div>
                    </div>

                    <div className='he-grid'>
                        <AnimatePresence>
                            {reports.map((r, i) => (
                                <motion.div
                                    key={r._id}
                                    className='he-rcard'
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                    transition={{ delay: i * 0.04 }}
                                    whileHover={{ y: -3, transition: { duration: 0.18 } }}
                                    onClick={() => navigate(`/interview/${r._id}`)}
                                >
                                    <div className='he-rcard__top'>
                                        <span className={`he-rcard__score he-rcard__score--${scoreClass(r.matchScore)}`}>
                                            {r.matchScore}% match
                                        </span>
                                        <button className='he-rcard__del' onClick={(e) => handleDelete(e, r._id)} disabled={deletingId === r._id} title='Delete'>
                                            {deletingId === r._id
                                                ? <svg className='spin' width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M12 2a10 10 0 0 1 10 10"/></svg>
                                                : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                                            }
                                        </button>
                                    </div>
                                    <h3 className='he-rcard__title'>{r.title || 'Untitled Position'}</h3>
                                    <p className='he-rcard__date'>{new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                    <span className='he-rcard__cta'>View Strategy →</span>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </section>
            )}

            <footer className='he-foot'>
                <div className='he-foot__inner'>
                    <div className='he-foot__about'>
                        <a href='#dashboard-top' className='he-foot__brand' aria-label='Back to dashboard top'><Brand compact /></a>
                        <p>Better resumes, focused practice, and clearer next steps for every application.</p>
                        <span>Your interview data is private to your account.</span>
                    </div>

                    <nav className='he-foot__links' aria-label='Dashboard quick links'>
                        <strong>Quick links</strong>
                        <a href='#dashboard-top'>Overview</a>
                        <a href='#new-application'>New application</a>
                        {reports.length > 0 && <a href='#my-plans'>My interview plans</a>}
                    </nav>

                    <div className='he-foot__connect'>
                        <strong>Connect</strong>
                        <div className='he-foot__socials'>
                            <a href='https://www.linkedin.com/in/ashifrza/' target='_blank' rel='noreferrer' aria-label='Ashif Rza on LinkedIn' title='LinkedIn'>
                                <svg viewBox='0 0 24 24' aria-hidden='true'><path d='M6.5 8.2V18M6.5 5.5v.1M10.5 18v-5.4c0-2.8 4.1-3 4.1 0V18M10.5 9.8V18' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round'/><rect x='3' y='3' width='18' height='18' rx='4' fill='none' stroke='currentColor' strokeWidth='1.6'/></svg>
                            </a>
                            <a href='https://github.com/' target='_blank' rel='noreferrer' aria-label='Ashif Rza on GitHub' title='GitHub'>
                                <svg viewBox='0 0 24 24' aria-hidden='true'><path d='M12 3a9 9 0 0 0-2.85 17.54c.45.08.62-.2.62-.43v-1.68c-2.52.55-3.05-1.07-3.05-1.07-.41-1.05-1-1.33-1-1.33-.82-.56.06-.55.06-.55.91.07 1.39.94 1.39.94.8 1.38 2.11.98 2.63.75.08-.59.31-.98.57-1.21-2.01-.23-4.13-1-4.13-4.45 0-.99.35-1.79.93-2.42-.09-.23-.4-1.15.09-2.39 0 0 .76-.24 2.48.92A8.6 8.6 0 0 1 12 7.31c.77 0 1.53.1 2.26.31 1.72-1.16 2.48-.92 2.48-.92.49 1.24.18 2.16.09 2.39.58.63.93 1.43.93 2.42 0 3.46-2.12 4.21-4.14 4.44.33.28.61.83.61 1.68v2.48c0 .24.17.52.62.43A9 9 0 0 0 12 3Z' fill='currentColor'/></svg>
                            </a>
                            <a href='https://www.google.in/' target='_blank' rel='noreferrer' aria-label='Visit Ashif Rza portfolio' title='Portfolio'>
                                <svg viewBox='0 0 24 24' aria-hidden='true'><circle cx='12' cy='12' r='9' fill='none' stroke='currentColor' strokeWidth='1.7'/><path d='M3.5 12h17M12 3c2.5 2.5 3.6 5.5 3.6 9s-1.1 6.5-3.6 9c-2.5-2.5-3.6-5.5-3.6-9S9.5 5.5 12 3Z' fill='none' stroke='currentColor' strokeWidth='1.5'/></svg>
                            </a>
                            <a href='mailto:ashifrza18@gmail.com' aria-label='Email Ashif Rza' title='Email'>
                                <svg viewBox='0 0 24 24' aria-hidden='true'><rect x='3' y='5' width='18' height='14' rx='3' fill='none' stroke='currentColor' strokeWidth='1.7'/><path d='m5 8 7 5 7-5' fill='none' stroke='currentColor' strokeWidth='1.7' strokeLinecap='round' strokeLinejoin='round'/></svg>
                            </a>
                        </div>
                    </div>
                </div>
                <div className='he-foot__bottom'><span>© {new Date().getFullYear()} HireEdge</span><span>Designed and built by Ashif Rza</span></div>
            </footer>
        </div>
    )
}

export default Home
