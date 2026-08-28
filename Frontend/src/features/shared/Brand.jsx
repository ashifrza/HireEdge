import './brand.scss'

const Brand = ({ compact = false, light = false }) => (
  <span className={`brand-lockup${compact ? ' brand-lockup--compact' : ''}${light ? ' brand-lockup--light' : ''}`}>
    <span className='brand-lockup__mark' aria-hidden='true'>
      <svg viewBox='0 0 32 32' fill='none'>
        <path d='M8 8.5h12.5a3.5 3.5 0 0 1 0 7H13a3.5 3.5 0 0 0 0 7h11' stroke='currentColor' strokeWidth='3.2' strokeLinecap='round'/>
        <path d='M8 7v18' stroke='currentColor' strokeWidth='3.2' strokeLinecap='round'/>
      </svg>
    </span>
    <span className='brand-lockup__word'>Hire<span>Edge</span></span>
  </span>
)

export default Brand
