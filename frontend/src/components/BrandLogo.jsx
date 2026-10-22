const BrandLogo = ({ className = 'h-10 w-auto', alt = '7 Super City logo' }) => (
    <span role="img" aria-label={alt} className={`brand-lockup ${className}`}>
        <span className="brand-symbol"><svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M9 14h22l-2 18H11L9 14Z" stroke="currentColor" strokeWidth="1.5" /><path d="M15 15v-4a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="1.5" /><path d="M16 19h10l-7 10" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
        <span className="brand-type"><strong>SUPER CITY<span>®</span></strong><small>EVERYDAY, ELEVATED.</small></span>
    </span>
);
export default BrandLogo;
