import React, { useEffect, useState } from 'react';

interface PopupProps {
    type: 'informative' | 'error' | 'confirmation';
    message: string;
    onClose: () => void;
}

const Popup: React.FC<PopupProps> = ({ type, message, onClose }) => {
    const [visible, setVisible] = useState(false); // Start as hidden for animation

    // Define colors for each type
    const typeColors = {
        informative: 'bg-blue-500', // Informative: Blue
        error: 'bg-red-500',       // Error: Red
        confirmation: 'bg-green-500', // Confirmation: Green
    };

    // Handle visibility and auto-close
    useEffect(() => {
        // Make the popup visible with animation
        const appearTimer = setTimeout(() => setVisible(true), 50); // Slight delay for animation
        // Start fade-out animation after 3 seconds
        const fadeOutTimer = setTimeout(() => setVisible(false), 3000);
        // Remove the popup completely after the fade-out animation
        const cleanupTimer = setTimeout(onClose, 3500);

        return () => {
            clearTimeout(appearTimer);
            clearTimeout(fadeOutTimer);
            clearTimeout(cleanupTimer);
        };
    }, [onClose]);

    return (
        <div
            className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 w-3/4 max-w-md py-2 px-4 text-center font-bold shadow-lg z-50 text-white ${
                typeColors[type]
            } ${visible ? 'opacity-90 translate-y-0' : 'opacity-0 translate-y-4'} transition-all duration-500 rounded-lg`}
        >
            {message}
        </div>
    );
};

export default Popup;
