import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

export default function RouteExperience() {
    const { pathname, hash, key } = useLocation();
    const navigationType = useNavigationType();
    const positions = useRef(new Map());
    useLayoutEffect(() => () => {
        positions.current.set(key, window.scrollY);
    }, [key]);
    useEffect(() => {
        let frame;
        let observer;
        const apply = () => {
            const heading = document.querySelector('h1');
            const anchor = hash ? document.getElementById(hash.slice(1)) : null;
            if (!heading && !anchor) return;
            observer?.disconnect();
            document.title = `${heading?.textContent?.trim() || 'Welcome'} | 7 Super City`;
            if (anchor) anchor.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
            else window.scrollTo({ top: navigationType === 'POP' ? positions.current.get(key) || 0 : 0, left: 0, behavior: 'instant' });
            if (heading && !hash) {
                heading.setAttribute('tabindex', '-1');
                heading.focus({ preventScroll: true });
            }
        };
        observer = new MutationObserver(() => { cancelAnimationFrame(frame); frame = requestAnimationFrame(apply); });
        observer.observe(document.getElementById('root'), { childList: true, subtree: true });
        frame = requestAnimationFrame(apply);
        return () => { cancelAnimationFrame(frame); observer.disconnect(); };
    }, [pathname, hash, key, navigationType]);
    return null;
}
