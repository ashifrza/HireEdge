import { Link } from 'react-router'
import '../auth.form.scss'
import { useAuth } from '../hooks/useAuth'
import AuthShell from '../components/AuthShell.jsx'
import PasswordlessAuth from '../components/PasswordlessAuth.jsx'

const Register = () => {
  const { loading } = useAuth()
  if (loading) return <main className='auth-loading'><div className='auth-spinner'/></main>

  return (
    <AuthShell eyebrow='START FREE' title='Create your HireEdge account.' description='Use Google, your email, or an Indian mobile number. We’ll verify it before creating the account.'>
      <PasswordlessAuth />
      <p className='auth-card__footer'>Already have an account? <Link to='/login'>Sign in</Link></p>
    </AuthShell>
  )
}

export default Register
