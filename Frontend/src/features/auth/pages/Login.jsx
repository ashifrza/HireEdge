// ==================== Login.jsx ====================
import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

const Login_Component = () => {
    const { loading, handleLogin } = useAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!email || !password) { toast.error('Please fill in all fields'); return }
        setSubmitting(true)
        try {
            await handleLogin({ email, password })
            toast.success('Welcome back!')
            navigate('/')
        } catch {
            toast.error('Invalid email or password')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return (
        <main className='auth-loading'>
            <div className='auth-spinner'/>
        </main>
    )

    return (
        <main className='auth-page'>
            <div className='auth-bg'/>
            <motion.div
                className='auth-card'
                initial={{ opacity: 0, y: 32, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
                <div className='auth-card__brand'>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
                    </svg>
                    HireEdge
                </div>

                <div className='auth-card__header'>
                    <h1>Welcome back</h1>
                    <p>Sign in to your account to continue</p>
                </div>

                <form className='auth-form' onSubmit={handleSubmit}>
                    <motion.div className='input-group' initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                        <label htmlFor="email">Email address</label>
                        <input onChange={(e) => setEmail(e.target.value)} type="email" id="email" placeholder="you@example.com" autoComplete="email"/>
                    </motion.div>

                    <motion.div className='input-group' initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
                        <label htmlFor="password">Password</label>
                        <input onChange={(e) => setPassword(e.target.value)} type="password" id="password" placeholder="••••••••" autoComplete="current-password"/>
                    </motion.div>

                    <motion.button
                        type='submit'
                        className={`auth-btn ${submitting ? 'auth-btn--loading' : ''}`}
                        disabled={submitting}
                        whileHover={!submitting ? { scale: 1.01 } : {}}
                        whileTap={!submitting ? { scale: 0.98 } : {}}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                    >
                        {submitting ? 'Signing in...' : 'Sign In'}
                    </motion.button>
                </form>

                <p className='auth-card__footer'>
                    Don't have an account? <Link to="/register">Create one</Link>
                </p>
            </motion.div>
        </main>
    )
}

export default Login_Component