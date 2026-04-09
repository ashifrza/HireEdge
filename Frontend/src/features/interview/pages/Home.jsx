import React, { useState, useRef } from 'react'
import '../style/home.scss'
import { useInterview } from '../hooks/useInterview.js'
import { useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import Navbar from '../../shared/Navbar'

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
    const [deletingId, setDeletingId] = useState(null)
    const resumeInputRef = useRef()
    const navigate = useNavigate()

    const handleFileChange = (e) => {
        const f = e.target.files[0]
        if (f) setFileName(f.name)
    }

    const handleDrop = (e) => {
        e.preventDefault(); setIsDragging(false)
        const f = e.dataTransfer.files[0]
        if (f && (f.type === 'application/pdf' || f.name.endsWith('.docx'))) {
            const dt = new DataTransfer(); dt.items.add(f)
            resumeInputRef.current.files = dt.files; setFileName(f.name)
        } else { toast.error('Please upload PDF or DOCX') }
    }

    const handleGenerate = async () => {
        if (!jobDescription.trim()) { toast.error('Job description is required'); return }
        if (!resumeInputRef.current?.files[0] && !selfDescription.trim()) {
            toast.error('Upload a resume or add a self-description'); return
        }
        const resumeFile = resumeInputRef.current?.files[0]
        const t = toast.loading('AI is analyzing your profile...')
        try {
            const data = await generateReport({ jobDescription, selfDescription, resumeFile })
            toast.dismiss(t); toast.success('Interview strategy ready!')
            navigate(`/interview/${data._id}`)
        } catch { toast.dismiss(t); toast.error('Failed to generate. Please retry.') }
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
        <div className='he-home'>
            <Navbar />

            {/* ── Hero ── */}
            <section className='he-hero'>
                <motion.div className='he-hero__inner' initial='hidden' animate='show' variants={{ show: { transition: { staggerChildren: 0.09 } } }}>
                    <motion.div className='he-hero__pill' variants={fadeUp} custom={0}>
                        <span className='he-live-dot'/>
                        AI-Powered Interview Preparation
                    </motion.div>
                    <motion.h1 variants={fadeUp} custom={1}>
                        Build Your <em>Winning</em><br/>Interview Strategy
                    </motion.h1>
                    <motion.p className='he-hero__sub' variants={fadeUp} custom={2}>
                        Upload your resume, paste the job description — get a personalized prep plan, interview questions, and an ATS-ready resume in 30 seconds.
                    </motion.p>
                    <motion.div className='he-hero__chips' variants={fadeUp} custom={3}>
                        {['Technical Questions', 'Behavioral Questions', 'Skill Gap Analysis', 'Prep Roadmap', 'AI Resume PDF'].map(c => (
                            <span key={c} className='he-chip'>{c}</span>
                        ))}
                    </motion.div>
                </motion.div>
            </section>

            {/* ── Input Section ── */}
            <section className='he-form-section'>
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
                                    <p className='he-dropzone__sub'>PDF or DOCX · Max 3MB</p>
                                </>
                            )}
                            <input ref={resumeInputRef} hidden type='file' id='he-resume' accept='.pdf,.docx' onChange={handleFileChange}/>
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
                        Gemini AI · Approx. 30 seconds
                    </span>
                    <button className='he-gen-btn' onClick={handleGenerate}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
                        Generate My Interview Strategy
                    </button>
                </motion.div>
            </section>

            {/* ── Reports Grid ── */}
            {reports.length > 0 && (
                <section className='he-reports'>
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
                <a href='#'>Privacy Policy</a><span>·</span>
                <a href='#'>Terms of Service</a><span>·</span>
                <a href='#'>Help Center</a>
            </footer>
        </div>
    )
}

export default Home