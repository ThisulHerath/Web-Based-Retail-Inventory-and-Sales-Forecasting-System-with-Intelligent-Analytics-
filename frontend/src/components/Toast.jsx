import { useEffect, useRef } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
    const closeRef = useRef(onClose);
    closeRef.current = onClose;
    useEffect(() => {
        if (duration == null) {
            return undefined;
        }

        const timer = setTimeout(() => {
            closeRef.current?.();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, message]);

    return (
        <div role={type === 'success' ? 'status' : 'alert'} className="fixed top-4 right-4 left-4 sm:left-auto sm:max-w-md z-[9999] animate-fade-in">
            <div
                className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${type === 'success'
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}
            >
                {type === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                )}
                <p className="font-medium">{message}</p>
                <button
                    type="button"
                    aria-label="Dismiss notification"
                    onClick={onClose}
                    className="ml-2 hover:opacity-70 transition-opacity"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default Toast;
