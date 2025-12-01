import React, { useEffect, useState, useRef } from 'react';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';

export interface PopupProps {
    type: 'informative' | 'error' | 'confirmation';
    message: string;
    onClose: () => void;
    duration?: number;
}

const Popup: React.FC<PopupProps> = ({ type, message, onClose, duration = 4000 }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const config = {
        informative: {
            icon: <FiInfo className="w-5 h-5" />,
            style: 'border-blue-500 text-blue-400',
            bg: 'bg-slate-800',
        },
        error: {
            icon: <FiAlertCircle className="w-5 h-5" />,
            style: 'border-red-500 text-red-400',
            bg: 'bg-slate-900',
        },
        confirmation: {
            icon: <FiCheckCircle className="w-5 h-5" />,
            style: 'border-green-500 text-green-400',
            bg: 'bg-slate-800',
        },
    };

    const currentConfig = config[type];

    const startExit = () => {
        setIsLeaving(true);
        setIsVisible(false);
        setTimeout(onClose, 300); 
    };

    const startTimer = () => {
        timerRef.current = setTimeout(startExit, duration);
    };

    const pauseTimer = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
    };

    useEffect(() => {
        const enterTimer = setTimeout(() => setIsVisible(true), 10);
        startTimer();

        return () => {
            clearTimeout(enterTimer);
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    return (
        <div
            onMouseEnter={pauseTimer} // Zatrzymaj licznik po najechaniu
            onMouseLeave={startTimer} // Wznów po zjechaniu
            className={`
                fixed bottom-6 left-1/2 z-[100]
                flex w-auto min-w-[300px] max-w-md items-center gap-3
                rounded-xl border-l-4 ${currentConfig.style} ${currentConfig.bg}
                px-4 py-3 shadow-2xl shadow-black/50
                transition-all duration-300 ease-out
                ${isVisible && !isLeaving 
                    ? 'translate-y-0 opacity-100 scale-100' 
                    : 'translate-y-8 opacity-0 scale-95 pointer-events-none'}
                -translate-x-1/2 transform
            `}
            role="alert"
        >
            <div className="flex-shrink-0">
                {currentConfig.icon}
            </div>

            <p className="flex-1 text-sm font-medium text-white/90">
                {message}
            </p>

            <button
                onClick={startExit}
                className="ml-2 flex-shrink-0 rounded-lg p-1 text-white/40 transition hover:bg-white/10 hover:text-white"
                aria-label="Close"
            >
                <FiX className="w-4 h-4" />
            </button>
        </div>
    );
};

export default Popup;