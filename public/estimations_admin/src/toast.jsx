import React, { useEffect, useState } from 'react';

export default function Toast({ message, duration = 3000, onClose, type = 'success' }) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            if (onClose) onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    if (!visible) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: '24px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 9999,
            }}
        >
            <div
                style={{
                    background: 'linear-gradient(135deg, #1F9352, #056E9D)',
                    color: 'white',
                    padding: '16px 32px',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(31, 147, 82, 0.15)',
                    fontWeight: '500',
                    fontSize: '0.95rem',
                    letterSpacing: '0.015em',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    userSelect: 'none',
                    cursor: 'default',
                    animation: 'toastFadeInOut 3s ease-in-out',
                    minWidth: '300px',
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
            >
                {message}
            </div>

            <style>{`
                @keyframes toastFadeInOut {
                    0% { 
                        opacity: 0;
                        transform: translateY(-20px) scale(0.95);
                    }
                    15% { 
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                    85% { 
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                    100% { 
                        opacity: 0;
                        transform: translateY(-20px) scale(0.95);
                    }
                }

                @media (max-width: 640px) {
                    .toast {
                        width: 90%;
                        max-width: none;
                    }
                }
            `}</style>
        </div>
    );
}