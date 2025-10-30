import React from 'react';
import Modal from './Modal';

interface LeaveModalProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

const LeaveModal: React.FC<LeaveModalProps> = ({ isOpen, onConfirm, onCancel }) => {
    return (
        <Modal isOpen={isOpen} onClose={onCancel}>
            <div
                className="bg-background p-6 rounded-lg shadow-lg text-center"
                style={{
                    outline: '2px solid var(--color-highlight)',
                }}
            >
                <h2 className="text-highlight text-xl font-bold mb-4">Leave Lobby</h2>
                <p className="text-paragraph mb-6">
                    Are you sure you want to leave the lobby?
                    <br />
                    <span className="text-red-400 font-semibold">You will lose all your progress and score for this session.</span>
                </p>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={onConfirm}
                        className="px-6 py-2 rounded bg-red-600 text-white font-bold hover:scale-105 transition-transform hover:bg-red-700"
                    >
                        Leave
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

export default LeaveModal;
