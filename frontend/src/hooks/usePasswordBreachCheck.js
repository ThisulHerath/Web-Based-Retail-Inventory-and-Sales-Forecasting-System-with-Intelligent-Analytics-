import { useEffect, useState } from 'react';
import { checkPasswordBreach } from '../services/passwordService';
import { PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH } from '../utils/passwordPolicy';

const idleState = {
    state: 'idle',
    breached: false,
    count: 0,
    skipped: false,
    message: '',
};

export const usePasswordBreachCheck = (password) => {
    const [status, setStatus] = useState(idleState);

    useEffect(() => {
        let isActive = true;

        if (!password || password.length < PASSWORD_MIN_LENGTH || password.length > PASSWORD_MAX_LENGTH) {
            setStatus(idleState);
            return () => {
                isActive = false;
            };
        }

        const timer = setTimeout(async () => {
            setStatus((prev) => ({ ...prev, state: 'checking', message: '' }));
            try {
                const result = await checkPasswordBreach(password);
                if (!isActive) return;
                setStatus({
                    state: 'done',
                    breached: Boolean(result.breached),
                    count: Number(result.count || 0),
                    skipped: Boolean(result.skipped),
                    message: '',
                });
            } catch (error) {
                if (!isActive) return;
                setStatus({
                    state: 'error',
                    breached: false,
                    count: 0,
                    skipped: false,
                    message: error?.response?.data?.message || 'Unable to check password breach status.',
                });
            }
        }, 450);

        return () => {
            isActive = false;
            clearTimeout(timer);
        };
    }, [password]);

    return status;
};
