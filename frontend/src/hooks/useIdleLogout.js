import { useEffect, useRef } from 'react';

const DEFAULT_EVENTS = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];

const useIdleLogout = ({ enabled, timeoutMs, onIdle, events = DEFAULT_EVENTS }) => {
    const timeoutRef = useRef(null);
    const onIdleRef = useRef(onIdle);

    useEffect(() => {
        onIdleRef.current = onIdle;
    }, [onIdle]);

    useEffect(() => {
        if (!enabled) {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            return undefined;
        }

        const resetTimer = () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(() => {
                onIdleRef.current?.();
            }, timeoutMs);
        };

        const handleActivity = () => {
            resetTimer();
        };

        resetTimer();

        events.forEach((eventName) => {
            window.addEventListener(eventName, handleActivity, true);
        });

        const handleVisibilityChange = () => {
            if (!document.hidden) {
                resetTimer();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }

            events.forEach((eventName) => {
                window.removeEventListener(eventName, handleActivity, true);
            });

            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [enabled, events, timeoutMs]);
};

export default useIdleLogout;