import React, { useState } from 'react';
import { FaLink, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { createLobby, joinLobby } from '../services/lobby';
import Popup from './Popup';
import type { PopupProps } from './Popup';

interface GameHeaderProps {
    title: string;
    minPlayers: number;
    maxPlayers: number;
    estimatedPlaytime: string;
    path: string;
}

const GameHeader: React.FC<GameHeaderProps> = ({ title, minPlayers, maxPlayers, estimatedPlaytime, path }) => {
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [joinCodeParts, setJoinCodeParts] = useState(['', '', '', '', '', '']);
    const [showNewLobbyModal, setShowNewLobbyModal] = useState(false);
    const [newLobbyName, setNewLobbyName] = useState('');
    const [isCreatingLobby, setIsCreatingLobby] = useState(false);
    const [isJoiningLobby, setIsJoiningLobby] = useState(false);
    const [popup, setPopup] = useState<PopupProps | null>(null);
    const navigate = useNavigate();

    const handleJoinClick = () => {
        setShowJoinModal(true);
    };

    const handleNewLobbyClick = () => {
        setShowNewLobbyModal(true);
    };

    const handleCloseModal = () => {
        setShowJoinModal(false);
        setJoinCodeParts(['', '', '', '', '', '']);
    };

    const handleCreateLobby = async () => {
        setIsCreatingLobby(true);
        try {
            const response = await createLobby({ max_players: 6 });
            setShowNewLobbyModal(false);
            setNewLobbyName('');
            navigate(`/lobby/${response.lobby_code}`);
        } catch (error) {
            setPopup({ 
                type: 'error', 
                message: error instanceof Error ? error.message : 'Failed to create lobby. Please try again.',
                onClose: () => setPopup(null)
            });
        } finally {
            setIsCreatingLobby(false);
        }
    };

    const handleLobbyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^a-zA-Z0-9-_]/g, '').slice(0, 25);
        setNewLobbyName(value);
    };

    const handlePartChange = (index: number, value: string, inputs: NodeListOf<HTMLInputElement>) => {
        const sanitizedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 1);
        const updatedParts = [...joinCodeParts];
        updatedParts[index] = sanitizedValue;
        setJoinCodeParts(updatedParts);

        const inputsArray = Array.from(inputs); 
        if (sanitizedValue && index < inputsArray.length - 1) {
            const nextInput = inputsArray[index + 1];
            nextInput.focus();
            nextInput.select(); 
        }
    };

    const handleConfirmJoin = async () => {
        const joinCode = joinCodeParts.join('');
        setIsJoiningLobby(true);
        try {
            await joinLobby(joinCode);
            setShowJoinModal(false);
            navigate(`/lobby/${joinCode}`);
        } catch (error) {
            setPopup({ 
                type: 'error', 
                message: 'This code did not work',
                onClose: () => setPopup(null)
            });
        } finally {
            setIsJoiningLobby(false);
        }
    };

    const isJoinCodeComplete = joinCodeParts.every((part) => part !== '');

    return (
        <div className="game-header flex flex-wrap w-full py-4 gap-4 items-center sm:flex-nowrap"> 
            <div className="game-header-icon w-full sm:w-auto flex justify-center sm:mr-4">
                <img src={path} alt={`${title} icon`} style={{ maxWidth: '150px', maxHeight: '150px' }} />
            </div>
            <div className="bg-background-secondary w-full h-auto p-6 rounded-lg flex flex-wrap items-center justify-center gap-4 sm:justify-between text-center mx-auto flex-col sm:flex-row min-w-[290px]">
                <div className="game-header-details max-w-[250px] mx-auto">
                    <h1 className="game-header-title text-3xl font-bold text-headline">{title}</h1>
                    <p className="game-header-info text-paragraph">
                        Minimum number of players: {minPlayers}<br />
                        Maximum number of players: {maxPlayers}<br />
                        Estimated playtime: {estimatedPlaytime}
                    </p>
                </div>
                <div className="game-header-actions mt-4 sm:mt-0 flex flex-wrap gap-3 justify-center mx-auto">
                    <button
                        className="game-header-btn text-highlight border border-highlight rounded-lg flex items-center justify-center gap-1 w-30 h-15 transform transition-transform duration-200 hover:scale-110 cursor-pointer"
                        onClick={handleJoinClick}
                    >
                        <FaLink /> Join
                    </button>
                    <button
                        className="game-header-btn text-highlight border border-highlight rounded-lg flex items-center justify-center gap-1 w-30 h-15 transform transition-transform duration-200 hover:scale-110 cursor-pointer"
                        onClick={handleNewLobbyClick}
                    >
                        <FaPlus /> New Lobby
                    </button>
                </div>
            </div>

            {showJoinModal && (
                <div
                    className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50"
                    style={{ backdropFilter: 'blur(8px)' }}
                    onClick={handleCloseModal}
                >
                    <div
                        className="bg-background p-6 rounded-lg shadow-lg text-center"
                        style={{
                            outline: '2px solid var(--color-highlight)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-highlight text-xl font-bold mb-4">Enter Join Code</h2>
                        <p className="text-paragraph mb-4">
                            Please enter the join code to proceed.
                        </p>
                        <div className="flex justify-center items-center gap-2 mb-4">
                            {joinCodeParts.map((part, index) => (
                                <React.Fragment key={index}>
                                    <input
                                        type="text"
                                        value={part}
                                        onChange={(e) => handlePartChange(index, e.target.value, e.currentTarget.parentElement!.querySelectorAll('input'))}
                                        onFocus={(e) => e.target.select()} 
                                        className="w-10 h-10 text-center border border-gray-300 rounded text-highlight bg-transparent font-bold"
                                        maxLength={1}
                                        disabled={isJoiningLobby}
                                    />
                                    {index === 2 && <span className="text-highlight font-bold">-</span>}
                                </React.Fragment>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 mb-4">Format: XXX-XXX (6 alphanumeric characters)</p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={handleConfirmJoin}
                                className={`px-4 py-2 rounded transform transition-transform duration-200 ${
                                    isJoinCodeComplete && !isJoiningLobby
                                        ? 'bg-highlight text-white cursor-pointer hover:scale-105'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                                disabled={!isJoinCodeComplete || isJoiningLobby}
                            >
                                {isJoiningLobby ? 'Joining...' : 'Confirm'}
                            </button>
                            <button
                                onClick={handleCloseModal}
                                className="px-4 py-2 bg-gray-300 text-black rounded transform transition-transform duration-200 hover:scale-105 disabled:opacity-50"
                                disabled={isJoiningLobby}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showNewLobbyModal && (
                <div
                    className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50"
                    style={{ backdropFilter: 'blur(8px)' }}
                    onClick={() => setShowNewLobbyModal(false)}
                >
                    <div
                        className="bg-background p-6 rounded-lg shadow-lg text-center"
                        style={{
                            outline: '2px solid var(--color-highlight)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-highlight text-xl font-bold mb-4">Create New Lobby</h2>
                        <p className="text-paragraph mb-4">
                            Enter a name for your new lobby.
                        </p>
                        <input
                            type="text"
                            value={newLobbyName}
                            onChange={handleLobbyNameChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded mb-4 text-highlight"
                            placeholder="Lobby Name"
                            spellCheck="false"
                            disabled={isCreatingLobby}
                        />
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={handleCreateLobby}
                                disabled={isCreatingLobby}
                                className={`px-4 py-2 rounded transform transition-transform duration-200 ${
                                    !isCreatingLobby
                                        ? 'bg-highlight text-white cursor-pointer hover:scale-105'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                {isCreatingLobby ? 'Creating...' : 'Create'}
                            </button>
                            <button
                                onClick={() => setShowNewLobbyModal(false)}
                                disabled={isCreatingLobby}
                                className="px-4 py-2 bg-gray-300 text-black rounded transform transition-transform duration-200 hover:scale-105 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Popup */}
            {popup && (
                <Popup
                    type={popup.type}
                    message={popup.message}
                    onClose={popup.onClose}
                />
            )}
        </div>
    );
};

export default GameHeader;
