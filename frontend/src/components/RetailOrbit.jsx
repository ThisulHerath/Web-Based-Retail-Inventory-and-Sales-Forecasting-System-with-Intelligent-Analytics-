import { useId } from 'react';
import { Package, Sparkles, Layers, ArrowUpRight } from 'lucide-react';

// An original vector scene: decorative, resolution independent and data free.
export default function RetailOrbit({ storefront = false, compact = false }) {
    const uid = useId().replace(/:/g, '');
    return <div className={`retail-orbit ${compact ? 'orbit-compact' : ''}`} aria-hidden="true">
        <div className="orbit-halo" /><div className="orbit-ring orbit-ring-one" /><div className="orbit-ring orbit-ring-two" />
        <svg viewBox="0 0 500 420" fill="none" className="orbit-scene">
            <defs>
                <linearGradient id={`${uid}a`} x1="120" y1="70" x2="370" y2="380" gradientUnits="userSpaceOnUse"><stop stopColor="#c4b5fd" /><stop offset="1" stopColor="#6757d9" /></linearGradient>
                <linearGradient id={`${uid}b`} x1="215" y1="130" x2="320" y2="340" gradientUnits="userSpaceOnUse"><stop stopColor="#b1f5db" /><stop offset="1" stopColor="#55b8ac" /></linearGradient>
                <linearGradient id={`${uid}c`} x1="145" y1="240" x2="345" y2="340"><stop stopColor="#ffcbb3" /><stop offset="1" stopColor="#e98e88" /></linearGradient>
                <filter id={`${uid}s`} x="-40%" y="-40%" width="180%" height="200%"><feDropShadow dx="0" dy="20" stdDeviation="16" floodColor="#080e20" floodOpacity=".28" /></filter>
            </defs>
            <ellipse cx="250" cy="334" rx="166" ry="48" fill="#131d38" opacity=".5" />
            <ellipse cx="250" cy="317" rx="157" ry="45" fill="#344669" stroke="#64789f" />
            <ellipse cx="250" cy="307" rx="157" ry="45" fill="#2c3d60" stroke="#8a9abe" strokeOpacity=".4" />
            <g filter={`url(#${uid}s)`} className="orbit-object">
                <path d="M133 183 238 151 277 195 270 294 166 323 130 282Z" fill={`url(#${uid}a)`} />
                <path d="m133 183 105-32 39 44-105 32Z" fill="#d3c7ff" /><path d="m172 227 105-32-7 99-104 29Z" fill="#8970dc" />
                <path d="m173 174 37-11 39 44-38 11Z" fill="#f5efff" opacity=".7" /><path d="m212 218 37-11-3 37-14-6-21 17Z" fill="#e2d5ff" />
                <path d="m186 274 35-10m-35 19 26-7" stroke="#e7dfff" strokeWidth="4" strokeLinecap="round" />
            </g>
            <g filter={`url(#${uid}s)`} className="orbit-object orbit-object-back">
                <path d="m274 148 88 22 17 132-106 23-36-30Z" fill={`url(#${uid}b)`} />
                <path d="m274 148 88 22-3 122-86 33Z" fill="#8ce2c5" /><path d="m274 148-37 33v114l36 30Z" fill="#53b8ac" />
                <path d="M290 174v-35c0-39 47-22 47 8v38" stroke="#cdf9e9" strokeWidth="8" strokeLinecap="round" />
                <path d="m302 222 21-7 19 9-20 8Z" fill="#277d7d" /><path d="m302 222 20 10v22l-20-12Zm20 10 20-8v22l-20 8Z" fill="#358e86" />
            </g>
            <g className="orbit-sparkles" stroke="#d4c7ff" strokeWidth="2"><path d="M130 95v18m-9-9h18M387 129v14m-7-7h14M393 293v14m-7-7h14" /><circle cx="188" cy="114" r="3" fill="#a1efce" /><circle cx="382" cy="224" r="4" fill="#ffceb5" /></g>
            <path d="m133 329 35 11 37-10" stroke="#af9ef4" strokeWidth="3" strokeLinecap="round" />
        </svg>
        {!compact && <>
            <div className="orbit-chip chip-one"><span className="chip-icon mint"><Package size={19} /></span><span><small>{storefront ? 'Thoughtfully selected' : 'Everything in sync'}</small><strong>{storefront ? 'Fresh picks, daily' : 'Smarter inventory'}</strong></span><ArrowUpRight size={16} /></div>
            <div className="orbit-chip chip-two"><span className="chip-icon lavender">{storefront ? <Sparkles size={19} /> : <Layers size={19} />}</span><span><small>{storefront ? 'A little more rewarding' : 'One connected workspace'}</small><strong>{storefront ? '7+ loyalty rewards' : 'Sales. Stock. Insights.'}</strong></span></div>
            <span className="orbit-dot orbit-dot-one" /><span className="orbit-dot orbit-dot-two" />
        </>}
    </div>;
}
