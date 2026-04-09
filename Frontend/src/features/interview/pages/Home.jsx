import React, { useState, useRef } from 'react'
import "../style/home.scss"
import { useInterview } from '../hooks/useInterview.js'
import { useAuth } from '../../auth/hooks/useAuth'
import { useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { FreeMode, Mousewheel } from 'swiper/modules'
import 'swiper/css'
import toast from 'react-hot-toast'

// ── Animation variants ─────────────────────────────────────────────────────────
const stagger = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}
const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } }
}

// ── Loading Screen ─────────────────────────────────────────────────────────────
const LoadingScreen = () => (
    <main className='loading-screen'>
        <div className='loading-ring'>
            <svg viewBox="0 0 50 50" width="48" height="48">
                <circle cx="25" cy="25" r="20" fill="none" stroke="rgba(255,45,120,0.15)" strokeWidth="4"/>
                <circle cx="25" cy="25" r="20" fill="none" stroke="#ff2d78" strokeWidth="4"
                    strokeDasharray="60 75" strokeLinecap="round" className='loading-ring__arc'/>
            </svg>
        </div>
        <p className='loading-screen__text'>Crafting your personalized interview strategy<span className='loading-dots'><span>.</span><span>.</span><span>.</span></span></p>
    </main>
)

// ── Main Component ─────────────────────────────────────────────────────────────
const Home = () => {
    const { loading, generateReport, reports } = useInterview()
    const { user, handleLogout } = useAuth()
    const [jobDescription, setJobDescription] = useState("")
    const [selfDescription, setSelfDescription] = useState("")
    const [fileName, setFileName] = useState("")
    const [isDragging, setIsDragging] = useState(false)
    const resumeInputRef = useRef()
    const navigate = useNavigate()

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) setFileName(file.name)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files[0]
        if (file && (file.type === 'application/pdf' || file.name.endsWith('.docx'))) {
            // Assign to the input via DataTransfer
            const dt = new DataTransfer()
            dt.items.add(file)
            resumeInputRef.current.files = dt.files
            setFileName(file.name)
        } else {
            toast.error('Please upload a PDF or DOCX file')
        }
    }

    const handleGenerateReport = async () => {
        if (!jobDescription.trim()) {
            toast.error('Please add a job description')
            return
        }
        if (!resumeInputRef.current?.files[0] && !selfDescription.trim()) {
            toast.error('Upload your resume or add a self-description')
            return
        }
        const resumeFile = resumeInputRef.current?.files[0]
        try {
            const loadingToast = toast.loading('Analyzing your profile with AI...')
            const data = await generateReport({ jobDescription, selfDescription, resumeFile })
            toast.dismiss(loadingToast)
            toast.success('Interview plan ready!')
            navigate(`/interview/${data._id}`)
        } catch {
            toast.error('Failed to generate report. Please try again.')
        }
    }

    const handleLogoutClick = async () => {
        await handleLogout()
        navigate('/login')
    }

    if (loading) return <LoadingScreen />

    const scoreClass = (score) =>
        score >= 80 ? 'score--high' : score >= 60 ? 'score--mid' : 'score--low'

    return (
        <motion.div className='home-page' variants={stagger} initial='hidden' animate='show'>

            {/* ── Top Nav ── */}
            <motion.nav className='home-nav' variants={fadeUp}>
                <span className='home-nav__logo'>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
                    </svg>
                    HireEdge
                </span>
                <div className='home-nav__right'>
                    {user && <span className='home-nav__user'>Hello, {user.username} 👋</span>}
                    <button className='home-nav__logout' onClick={handleLogoutClick}>Logout</button>
                </div>
            </motion.nav>

            {/* ── Page Header ── */}
            <motion.header className='page-header' variants={fadeUp}>
                <div className='page-header__eyebrow'>
                    <span className='eyebrow-dot' />
                    AI-Powered Interview Prep
                </div>
                <h1>Build Your <span className='highlight'>Winning Strategy</span></h1>
                <p>Let our AI analyze the job requirements and your unique profile to craft a personalized interview roadmap.</p>
            </motion.header>

            {/* ── Main Card ── */}
            <motion.div className='interview-card' variants={fadeUp}>
                <div className='interview-card__body'>

                    {/* Left Panel – Job Description */}
                    <div className='panel panel--left'>
                        <div className='panel__header'>
                            <span className='panel__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                                </svg>
                            </span>
                            <h2>Target Job Description</h2>
                            <span className='badge badge--required'>Required</span>
                        </div>
                        <textarea
                            onChange={(e) => setJobDescription(e.target.value)}
                            className='panel__textarea'
                            placeholder={`Paste the full job description here...\ne.g. "Senior Frontend Engineer at Google — requires proficiency in React, TypeScript, and large-scale system design..."`}
                            maxLength={5000}
                        />
                        <div className='char-counter'>
                            <span className={jobDescription.length > 4500 ? 'char-counter--warn' : ''}>
                                {jobDescription.length}
                            </span> / 5000
                        </div>
                    </div>

                    <div className='panel-divider' />

                    {/* Right Panel – Profile */}
                    <div className='panel panel--right'>
                        <div className='panel__header'>
                            <span className='panel__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                    <circle cx="12" cy="7" r="4"/>
                                </svg>
                            </span>
                            <h2>Your Profile</h2>
                        </div>

                        {/* Dropzone */}
                        <div className='upload-section'>
                            <label className='section-label'>
                                Upload Resume
                                <span className='badge badge--best'>Best Results</span>
                            </label>
                            <label
                                className={`dropzone ${fileName ? 'dropzone--has-file' : ''} ${isDragging ? 'dropzone--dragging' : ''}`}
                                htmlFor='resume'
                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={handleDrop}
                            >
                                {fileName ? (
                                    <>
                                        <span className='dropzone__file-badge'>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                                <polyline points="14 2 14 8 20 8"/>
                                            </svg>
                                        </span>
                                        <p className='dropzone__title'>{fileName}</p>
                                        <p className='dropzone__subtitle'>Click to replace</p>
                                    </>
                                ) : (
                                    <>
                                        <span className='dropzone__icon'>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="16 16 12 12 8 16"/>
                                                <line x1="12" y1="12" x2="12" y2="21"/>
                                                <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                                            </svg>
                                        </span>
                                        <p className='dropzone__title'>Click to upload or drag &amp; drop</p>
                                        <p className='dropzone__subtitle'>PDF or DOCX · Max 3MB</p>
                                    </>
                                )}
                                <input
                                    ref={resumeInputRef}
                                    hidden type='file' id='resume' name='resume'
                                    accept='.pdf,.docx'
                                    onChange={handleFileChange}
                                />
                            </label>
                        </div>

                        <div className='or-divider'><span>OR</span></div>

                        <div className='self-description'>
                            <label className='section-label' htmlFor='selfDescription'>Quick Self-Description</label>
                            <textarea
                                onChange={(e) => setSelfDescription(e.target.value)}
                                id='selfDescription' name='selfDescription'
                                className='panel__textarea panel__textarea--short'
                                placeholder="Briefly describe your experience, key skills, and years of experience if you don't have a resume handy..."
                            />
                        </div>

                        <div className='info-box'>
                            <span className='info-box__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                    <circle cx="12" cy="12" r="10"/>
                                    <line x1="12" y1="8" x2="12" y2="12" stroke="#0d1117" strokeWidth="2.5"/>
                                    <circle cx="12" cy="16" r="1" fill="#0d1117"/>
                                </svg>
                            </span>
                            <p>Either a <strong>Resume</strong> or a <strong>Self Description</strong> is required.</p>
                        </div>
                    </div>
                </div>

                {/* Card Footer */}
                <div className='interview-card__footer'>
                    <span className='footer-info'>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
                        </svg>
                        Gemini AI · Approx. 30 seconds
                    </span>
                    <button onClick={handleGenerateReport} className='generate-btn'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
                        </svg>
                        Generate My Interview Strategy
                    </button>
                </div>
            </motion.div>

            {/* ── Recent Reports Carousel ── */}
            {reports.length > 0 && (
                <motion.section className='recent-reports' variants={fadeUp}>
                    <div className='recent-reports__header'>
                        <h2>Recent Interview Plans</h2>
                        <span className='recent-reports__count'>{reports.length} plan{reports.length > 1 ? 's' : ''}</span>
                    </div>
                    <Swiper
                        modules={[FreeMode, Mousewheel]}
                        spaceBetween={12}
                        slidesPerView="auto"
                        freeMode
                        mousewheel={{ forceToAxis: true }}
                        className='reports-swiper'
                    >
                        {reports.map(report => (
                            <SwiperSlide key={report._id} className='report-slide'>
                                <motion.div
                                    className='report-card'
                                    whileHover={{ y: -3, transition: { duration: 0.2 } }}
                                    onClick={() => navigate(`/interview/${report._id}`)}
                                >
                                    <div className='report-card__top'>
                                        <h3>{report.title || 'Untitled Position'}</h3>
                                        <span className='report-card__arrow'>→</span>
                                    </div>
                                    <p className='report-card__date'>
                                        {new Date(report.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </p>
                                    <div className={`report-card__score ${scoreClass(report.matchScore)}`}>
                                        <span className='score-dot' />
                                        {report.matchScore}% match
                                    </div>
                                </motion.div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </motion.section>
            )}

            {/* ── Footer ── */}
            <motion.footer className='page-footer' variants={fadeUp}>
                <a href='#'>Privacy Policy</a>
                <span className='footer-sep'>·</span>
                <a href='#'>Terms of Service</a>
                <span className='footer-sep'>·</span>
                <a href='#'>Help Center</a>
            </motion.footer>

        </motion.div>
    )
}

export default Home