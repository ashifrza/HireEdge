import React from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../auth/hooks/useAuth'
import './navbar.scss'

const Navbar = ({ showBack = false, backTo = '/', title = '' }) => {
    const { user, handleLogout } = useAuth()
    const navigate = useNavigate()

    const handleLogoutClick = async () => {
        await handleLogout()
        navigate('/login')
    }

    return (
        <header className='site-nav'>
            <div className='site-nav__inner'>
                {/* Left */}
                <div className='site-nav__left'>
                    {showBack && (
                        <button className='site-nav__back' onClick={() => navigate(backTo)}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6"/>
                            </svg>
                        </button>
                    )}
                    <button className='site-nav__brand' onClick={() => navigate('/')}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
                        </svg>
                        HireEdge
                    </button>
                    {title && <span className='site-nav__title'>/ {title}</span>}
                </div>

                {/* Right */}
                <div className='site-nav__right'>
                    {user && (
                        <span className='site-nav__user'>
                            <span className='site-nav__avatar'>{user.username?.[0]?.toUpperCase()}</span>
                            {user.username}
                        </span>
                    )}
                    <button className='site-nav__logout' onClick={handleLogoutClick}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                        Logout
                    </button>
                </div>
            </div>
        </header>
    )
}

export default Navbar