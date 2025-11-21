import React from 'react';

export type ModalType = 'editLobbyName' | 'gameInfo' | 'catalogue' | 'passHost';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50"
            style={{ backdropFilter: 'blur(8px)' }}
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
};

export default Modal;
