import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import zxcvbn from 'zxcvbn';

const scoreClasses = ['bg-red-500', 'bg-red-400', 'bg-yellow-400', 'bg-amber-500', 'bg-green-600'];
const textClasses = ['text-red-600', 'text-red-500', 'text-yellow-600', 'text-amber-600', 'text-green-700'];
const textClassesOnDark = ['text-red-300', 'text-red-200', 'text-yellow-200', 'text-amber-200', 'text-emerald-200'];

const PasswordStrengthMeter = ({ password, tone = 'default' }) => {
    const { t } = useTranslation();

    const result = useMemo(() => {
        if (!password) return null;
        return zxcvbn(password);
    }, [password]);

    if (!result) return null;

    const score = Math.min(Math.max(result.score, 0), 4);
    const percent = (score / 4) * 100;

    const labelKey = [
        'password_strength.very_weak',
        'password_strength.weak',
        'password_strength.fair',
        'password_strength.good',
        'password_strength.strong',
    ][score];

    const isDarkTone = tone === 'dark';

    return (
        <div className="mt-2">
            <div className={`h-2 w-full rounded-full overflow-hidden ${isDarkTone ? 'bg-white/20' : 'bg-gray-200'}`}>
                <div
                    className={`h-2 ${scoreClasses[score]}`}
                    style={{ width: `${percent}%` }}
                />
            </div>
            <div className={`mt-1 text-xs font-semibold ${isDarkTone ? textClassesOnDark[score] : textClasses[score]}`}>
                {t('password_strength.label')}: {t(labelKey)}
            </div>
        </div>
    );
};

export default PasswordStrengthMeter;
