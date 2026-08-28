import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import "../auth.form.scss"
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import AuthShell from '../components/AuthShell.jsx'

const Register = () => {
    const navigate = useNavigate()
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const { loading, handleRegister } = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!username || !email || !password) { toast.error('Please fill in all fields'); return }
        if (password.length < 8) { toast.error('Password must be at least 8 characters'); return }
        setSubmitting(true)
        try {
            await handleRegister({ username, email, password })
            toast.success('Account created! Welcome to HireEdge 🎉')
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
        <AuthShell eyebrow='START FREE' title='Build your application kit.' description='Create one account for every tailored resume, match report, and practice session.'>
                <form className='auth-form' onSubmit={handleSubmit}>
                    {[
                        { label: 'Username', id: 'username', type: 'text', placeholder: 'johndoe', setter: setUsername, autoComplete: 'username', delay: 0.1 },
                        { label: 'Email address', id: 'email', type: 'email', placeholder: 'you@example.com', setter: setEmail, autoComplete: 'email', delay: 0.15 },
                        { label: 'Password', id: 'password', type: 'password', placeholder: '••••••••', setter: setPassword, autoComplete: 'new-password', delay: 0.2 },
                    ].map(field => (
                        <motion.div
                            key={field.id}
                            className='input-group'
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: field.delay }}
                        >
                            <label htmlFor={field.id}>{field.label}</label>
                            <input
                                onChange={(e) => field.setter(e.target.value)}
                                type={field.type} id={field.id}
                                placeholder={field.placeholder}
                                autoComplete={field.autoComplete}
                            />
                        </motion.div>
                    ))}

                    <motion.button
                        type='submit'
                        className={`auth-btn ${submitting ? 'auth-btn--loading' : ''}`}
                        disabled={submitting}
                        whileHover={!submitting ? { scale: 1.01 } : {}}
                        whileTap={!submitting ? { scale: 0.98 } : {}}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
                    >
                        {submitting ? 'Creating account...' : 'Create Account'}
                    </motion.button>
                </form>

                <p className='auth-card__footer'>
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
        </AuthShell>
    )
}

export default Register
