import React, { useState, useEffect } from 'react';
import Modal from './Modal';

interface EditLobbyNameModalProps {
    isOpen: boolean;
    currentName: string;
    onSave: (newName: string) => void;
    onCancel: () => void;
}

const EditLobbyNameModal: React.FC<EditLobbyNameModalProps> = ({ isOpen, currentName, onSave, onCancel }) => {
    const [editedName, setEditedName] = useState(currentName);

    useEffect(() => {
        if (!isOpen) {
            setEditedName(currentName);
        }
    }, [isOpen, currentName]);

    const handleSave = () => {
        if (editedName.trim()) {
            onSave(editedName);
        }
    };

    const handleCancel = () => {
        setEditedName(currentName);
        onCancel();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleCancel}>
            <div
                className="bg-background p-6 rounded-lg shadow-lg text-center"
                style={{
                    outline: '2px solid var(--color-highlight)',
                }}
            >
                <h2 className="text-highlight text-xl font-bold mb-4">Edit Lobby Name</h2>
                <p className="text-paragraph mb-4">
                    Enter a new name for your lobby.
                </p>
                <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-400 rounded mb-4 text-headline"
                    placeholder="Lobby Name"
                />
                <div className="flex justify-center gap-4">
                    <button
                        onClick={handleSave}
                        disabled={!editedName.trim()}
                        className={`px-4 py-2 rounded ${
                            editedName.trim()
                                ? 'bg-highlight text-white cursor-pointer hover:scale-105'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        } transition-transform`}
                    >
                        Save
                    </button>
                    <button
                        onClick={handleCancel}
                        className="bg-gray-400 text-black px-4 py-2 rounded hover:scale-105 transition-transform"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default EditLobbyNameModal;
