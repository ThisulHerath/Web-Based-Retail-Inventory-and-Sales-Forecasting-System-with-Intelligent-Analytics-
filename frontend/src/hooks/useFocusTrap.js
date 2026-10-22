import { useEffect, useRef } from 'react';

export default function useFocusTrap(active, selector, onClose, returnSelector) {
    const close = useRef(onClose);
    close.current = onClose;
    useEffect(() => {
        if (!active) return;
        const container = document.querySelector(selector);
        if (!container) return;
        const previous = document.activeElement;
        const targets = () => Array.from(container.querySelectorAll('a[href], button, input, select, textarea, [tabindex="0"]')).filter(node => !node.disabled && node.getClientRects().length && getComputedStyle(node).visibility !== 'hidden');
        const frame = requestAnimationFrame(() => targets()[0]?.focus());
        const handleKey = event => {
            if (event.key === 'Escape') { event.preventDefault(); close.current?.(); }
            if (event.key !== 'Tab') return;
            const elements = targets();
            const first = elements[0];
            const last = elements[elements.length - 1];
            if (!first) { event.preventDefault(); return; }
            if (event.shiftKey && (document.activeElement === first || !container.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
            else if (!event.shiftKey && (document.activeElement === last || !container.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
        };
        document.addEventListener('keydown', handleKey);
        return () => { cancelAnimationFrame(frame); document.removeEventListener('keydown', handleKey); const target = (returnSelector && document.querySelector(returnSelector)) || previous; if (target?.isConnected) target.focus({ preventScroll: true }); };
    }, [active, selector, returnSelector]);
}
