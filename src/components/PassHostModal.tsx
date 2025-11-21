import React from 'react';
import Modal from './Modal';

interface PassHostModalProps {
    username: string;
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

const PassHostModal: React.FC<PassHostModalProps> = ({ username, isOpen, onConfirm, onCancel }) => {
    return (
        <Modal isOpen={isOpen} onClose={onCancel}>
            <div
                className="bg-background p-6 rounded-lg shadow-lg text-center"
                style={{
                    outline: '2px solid var(--color-highlight)',
                }}
            >
                <h2 className="text-highlight text-xl font-bold mb-4">Transfer Host</h2>
                <p className="text-paragraph mb-6">
                    Are you sure you want to transfer host rights to <span className="font-bold text-highlight">{username}</span>? 
                    <br />
                    <span className="text-sm">You will no longer have control over the lobby settings and won't be able to undo this action.</span>
                </p>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={onConfirm}
                        className="px-6 py-2 rounded bg-highlight text-white font-bold hover:scale-105 transition-transform"
                    >
                        Confirm
                    </button>
                    <button
                        onClick={onCancel}
                        className="px-6 py-2 rounded bg-gray-400 text-black font-bold hover:scale-105 transition-transform"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default PassHostModal;
