import { useState, useEffect } from 'react';
import { AlertTriangle, Clock } from 'lucide-react';

/**
 * Session Timeout Warning Modal
 * Shows when user has been inactive for 4 minutes
 * Auto-closes and logs out after 5 minutes total
 */
const SessionTimeoutWarning = ({ 
    isVisible, 
    onExtendSession, 
    onLogout,
    userType = 'admin' // 'admin' or 'customer'
}) => {
    const [countdown, setCountdown] = useState(60); // 60 seconds remaining

    useEffect(() => {
        if (!isVisible) return;

        // Start countdown from 60 seconds
        setCountdown(60);
        const interval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    onLogout();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isVisible, onLogout]);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl border-l-4 border-red-500 animate-scale-in">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                            Session Timeout
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Your session is about to expire
                        </p>
                    </div>
                </div>

                {/* Message */}
                <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm leading-relaxed">
                    You have been inactive for 4 minutes. Your session will automatically end in{' '}
                    <span className="font-bold text-red-600 dark:text-red-400">{countdown} seconds</span>.
                </p>

                {/* Countdown Timer Display */}
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-6 flex items-center justify-center gap-2">
                    <Clock className="w-5 h-5 text-orange-500" />
                    <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
                    </span>
                </div>

                {/* Additional Info */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                        <strong>Tip:</strong> Click "Stay Logged In" or move your mouse/keyboard to extend your session.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onLogout}
                        className="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-lg transition-colors duration-200"
                    >
                        Logout Now
                    </button>
                    <button
                        onClick={onExtendSession}
                        className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-lg"
                    >
                        Stay Logged In
                    </button>
                </div>

                {/* Footer */}
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
                    {userType === 'admin' ? 'Admin Session' : 'Customer Session'} • 5 minutes timeout
                </p>
            </div>
        </div>
    );
};

export default SessionTimeoutWarning;
