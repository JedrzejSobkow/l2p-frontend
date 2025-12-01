import React, { useState } from 'react';
import Modal from './Modal';

interface KickPlayerModalProps {
  isOpen: boolean;
  username: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const KickPlayerModal: React.FC<KickPlayerModalProps> = ({ isOpen, username, onConfirm, onCancel }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onCancel}>
      <div
        className="bg-background p-6 rounded-lg shadow-lg text-center mx-4 sm:mx-0"
        style={{
          outline: '2px solid var(--color-highlight)',
        }}
      >
        <h2 className="text-highlight text-xl font-bold mb-4">Kick Player</h2>
        <p className="text-paragraph mb-4">
          Are you sure you want to kick <span className="font-bold">{username}</span> from the game? This action cannot be undone.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={handleConfirm}
            disabled={isProcessing}
            className={`px-4 py-2 rounded ${
              !isProcessing
                ? 'bg-red-500 text-white cursor-pointer hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            } transition-transform`}
          >
            {isProcessing ? 'Processing...' : 'Kick'}
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-400 text-black px-4 py-2 rounded hover:scale-105 transition-transform"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default KickPlayerModal;
