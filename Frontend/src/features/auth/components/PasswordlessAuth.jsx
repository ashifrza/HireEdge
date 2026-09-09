import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import toast from 'react-hot-toast'
import { requestOtp } from '../services/auth.api'
import { useAuth } from '../hooks/useAuth'

const GOOGLE_SCRIPT_ID = 'hireedge-google-identity'

const PasswordlessAuth = () => {
  const navigate = useNavigate()
  const { handleOtpVerification, handleGoogleAuth } = useAuth()
  const googleRef = useRef(null)
  const [channel, setChannel] = useState('email')
  const [value, setValue] = useState('')
  const [code, setCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  useEffect(() => {
    if (!seconds) return undefined
    const timer = window.setInterval(() => setSeconds((current) => Math.max(0, current - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [seconds])

  useEffect(() => {
    if (!googleClientId || !googleRef.current) return undefined
    let active = true
    const renderGoogleButton = () => {
      if (!active || !window.google?.accounts?.id || !googleRef.current) return
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async ({ credential }) => {
          setBusy(true)
          try {
            const data = await handleGoogleAuth(credential)
            toast.success(data.created ? 'Account created with Google.' : 'Welcome back!')
            navigate('/dashboard')
          } catch (error) {
            toast.error(error.message)
          } finally {
            setBusy(false)
          }
        },
      })
      googleRef.current.replaceChildren()
      window.google.accounts.id.renderButton(googleRef.current, {
        type: 'standard', theme: 'filled_black', size: 'large', shape: 'pill',
        text: 'continue_with', width: Math.min(376, googleRef.current.clientWidth || 376),
      })
    }
    const existing = document.getElementById(GOOGLE_SCRIPT_ID)
    if (existing) {
      if (window.google?.accounts?.id) renderGoogleButton()
      else existing.addEventListener('load', renderGoogleButton, { once: true })
    }
    else {
      const script = document.createElement('script')
      script.id = GOOGLE_SCRIPT_ID
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.onload = renderGoogleButton
      document.head.appendChild(script)
    }
    return () => {
      active = false
      existing?.removeEventListener('load', renderGoogleButton)
    }
  }, [googleClientId, handleGoogleAuth, navigate])

  const normalizedValue = channel === 'phone' ? value.replace(/\D/g, '').slice(-10) : value.trim()

  const sendCode = async () => {
    if (channel === 'email' && !/^\S+@\S+\.\S+$/.test(normalizedValue)) return toast.error('Enter a valid email address.')
    if (channel === 'phone' && !/^[6-9]\d{9}$/.test(normalizedValue)) return toast.error('Enter a valid 10-digit Indian mobile number.')
    setBusy(true)
    try {
      await requestOtp({ channel, value: normalizedValue })
      setCodeSent(true)
      setCode('')
      setSeconds(30)
      toast.success(`Code sent to your ${channel}.`)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setBusy(false)
    }
  }

  const verifyCode = async (event) => {
    event.preventDefault()
    if (!/^\d{6}$/.test(code)) return toast.error('Enter the complete six-digit code.')
    setBusy(true)
    try {
      const data = await handleOtpVerification({ channel, value: normalizedValue, code })
      toast.success(data.created ? 'Account created. Welcome to HireEdge!' : 'Welcome back!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setBusy(false)
    }
  }

  const changeChannel = (next) => {
    setChannel(next); setValue(''); setCode(''); setCodeSent(false); setSeconds(0)
  }

  return (
    <div className='passwordless-auth'>
      <div ref={googleRef} className={`auth-google${busy ? ' auth-google--busy' : ''}`}>
        {!googleClientId && <span>Google sign-in needs configuration</span>}
      </div>
      <div className='auth-divider'><span>or continue with Google</span></div>

      <div className='auth-methods' role='tablist' aria-label='Verification method'>
        <button type='button' role='tab' aria-selected={channel === 'email'} className={channel === 'email' ? 'active' : ''} onClick={() => changeChannel('email')}>Email</button>
        <button type='button' role='tab' aria-selected={channel === 'phone'} className={channel === 'phone' ? 'active' : ''} onClick={() => changeChannel('phone')}>India mobile</button>
      </div>

      {!codeSent ? (
        <div className='auth-code-request'>
          <label htmlFor='auth-destination'>{channel === 'email' ? 'Email address' : 'Mobile number'}</label>
          <div className={`auth-destination${channel === 'phone' ? ' auth-destination--phone' : ''}`}>
            {channel === 'phone' && <span>+91</span>}
            <input id='auth-destination' type={channel === 'email' ? 'email' : 'tel'} inputMode={channel === 'phone' ? 'numeric' : 'email'} autoComplete={channel === 'email' ? 'email' : 'tel-national'} value={value} onChange={(event) => setValue(event.target.value)} placeholder={channel === 'email' ? 'you@example.com' : '98765 43210'} onKeyDown={(event) => { if (event.key === 'Enter') sendCode() }}/>
          </div>
          <button type='button' className='auth-btn' disabled={busy} onClick={sendCode}>{busy ? 'Sending code…' : 'Send 6-digit code'}</button>
          {channel === 'phone' && <p className='auth-method-note'>Only Indian +91 mobile numbers are supported.</p>}
        </div>
      ) : (
        <form className='auth-code-verify' onSubmit={verifyCode}>
          <button type='button' className='auth-change' onClick={() => setCodeSent(false)}>← Change {channel}</button>
          <p>We sent a code to <strong>{channel === 'phone' ? `+91 ${normalizedValue}` : normalizedValue}</strong></p>
          <label htmlFor='auth-code'>Verification code</label>
          <input id='auth-code' className='auth-code-input' value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} inputMode='numeric' autoComplete='one-time-code' maxLength='6' placeholder='000000' autoFocus/>
          <button className='auth-btn' type='submit' disabled={busy}>{busy ? 'Verifying…' : 'Verify and continue'}</button>
          <button className='auth-resend' type='button' disabled={busy || seconds > 0} onClick={sendCode}>{seconds > 0 ? `Resend in ${seconds}s` : 'Resend code'}</button>
        </form>
      )}
    </div>
  )
}

export default PasswordlessAuth
