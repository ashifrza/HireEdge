// ==================== Login.jsx ====================
import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import AuthShell from '../components/AuthShell.jsx'

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
            navigate('/dashboard')
        } catch (error) {
            toast.error(error.message)
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
        <AuthShell eyebrow='WELCOME BACK' title='Continue building your edge.' description='Sign in to access your resumes, role matches, and interview plans.'>
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
        </AuthShell>
    )
}

export default Login_Component
