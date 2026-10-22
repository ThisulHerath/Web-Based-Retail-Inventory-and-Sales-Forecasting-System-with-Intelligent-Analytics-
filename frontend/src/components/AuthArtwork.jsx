import RetailOrbit from './RetailOrbit';
import { Sparkles } from 'lucide-react';
export default function AuthArtwork() {
    return <aside className="auth-artwork" aria-label="7 Super City rewards">
        <div className="hero-mesh" aria-hidden="true" />
        <span className="eyebrow"><Sparkles size={14} /> THE SUPER CITY EXPERIENCE</span>
        <RetailOrbit storefront />
        <div className="auth-artwork-copy"><h2>Good things.<br /><span>Every single day.</span></h2><p>Fresh discoveries, everyday essentials, and a little something extra with 7+ rewards.</p></div>
        <span className="auth-artwork-footnote">YOUR EVERYDAY. A LITTLE MORE SUPER.</span>
    </aside>;
}
