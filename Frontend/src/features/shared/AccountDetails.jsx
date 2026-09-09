import { useRef } from 'react'

const AccountDetails = ({ user }) => {
    const dialogRef = useRef(null)
    const username = user.username || 'Your account'
    const email = user.email?.endsWith('@phone.hireedge.local') ? null : user.email

    return (
        <>
            <button
                type='button'
                className='site-nav__user'
                aria-label={`Account details for ${username}`}
                aria-haspopup='dialog'
                onClick={() => dialogRef.current?.showModal()}
            >
                <span className='site-nav__avatar' aria-hidden='true'>{username[0].toUpperCase()}</span>
                <span className='site-nav__username'>{username}</span>
            </button>
            <dialog
                ref={dialogRef}
                className='account-details'
                aria-labelledby='account-details-title'
                aria-describedby='account-details-description'
                onClick={(event) => {
                    if (event.target === event.currentTarget) {
                        const bounds = event.currentTarget.getBoundingClientRect()
                        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) {
                            event.currentTarget.close()
                        }
                    }
                }}
            >
                <div className='account-details__header'>
                    <h2 id='account-details-title'>Account details</h2>
                    <button type='button' className='account-details__close' aria-label='Close account details' onClick={() => dialogRef.current?.close()}>
                        <svg aria-hidden='true' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='m6 6 12 12M18 6 6 18'/></svg>
                    </button>
                </div>
                <p id='account-details-description'>The contact details saved with your HireEdge account.</p>
                <dl className='account-details__list'>
                    <div><dt>Username</dt><dd>{username}</dd></div>
                    <div><dt>Email address</dt><dd>{email || 'Not provided'}</dd></div>
                    <div><dt>Phone number</dt><dd>{user.phone || 'Not provided'}</dd></div>
                </dl>
            </dialog>
        </>
    )
}

export default AccountDetails
