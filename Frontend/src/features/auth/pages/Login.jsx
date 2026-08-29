import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import toast from 'react-hot-toast'
import '../auth.form.scss'
import { useAuth } from '../hooks/useAuth'
import AuthShell from '../components/AuthShell.jsx'
import PasswordlessAuth from '../components/PasswordlessAuth.jsx'

const Login = () => {
  const { loading, handleLogin } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handlePasswordLogin = async (event) => {
    event.preventDefault()
    if (!email || !password) return toast.error('Enter your email and password.')
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

  if (loading) return <main className='auth-loading'><div className='auth-spinner'/></main>

  return (
    <AuthShell eyebrow='WELCOME BACK' title='Sign in to HireEdge.' description='Continue with Google or use a secure six-digit code. No password required.'>
      <PasswordlessAuth />
      <details className='auth-password'>
        <summary>Use my existing password</summary>
        <form className='auth-form' onSubmit={handlePasswordLogin}>
          <div className='input-group'><label htmlFor='password-email'>Email address</label><input id='password-email' type='email' value={email} onChange={(event) => setEmail(event.target.value)} autoComplete='email' placeholder='you@example.com'/></div>
          <div className='input-group'><label htmlFor='password'>Password</label><input id='password' type='password' value={password} onChange={(event) => setPassword(event.target.value)} autoComplete='current-password' placeholder='••••••••'/></div>
          <button className='auth-btn' disabled={submitting}>{submitting ? 'Signing in…' : 'Sign in with password'}</button>
        </form>
      </details>
      <p className='auth-card__footer'>New to HireEdge? <Link to='/register'>Create an account</Link></p>
    </AuthShell>
  )
}

export default Login
