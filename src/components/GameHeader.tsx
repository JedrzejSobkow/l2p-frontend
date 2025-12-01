import React, { useState, useEffect } from 'react';
import { FaLink, FaPlus } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { useLobby } from './lobby/LobbyContext';
import { usePopup } from './PopupContext';
import JoinCodeInput from "./JoinCodeInput";

interface GameHeaderProps {
    title: string;
    minPlayers: number;
    maxPlayers: number;
    path: string;
}

const GameHeader: React.FC<GameHeaderProps> = ({ title, minPlayers, maxPlayers, path }) => {
    const navigate = useNavigate();
    const { gameName } = useParams<{ gameName: string }>();
    const { createLobby, joinLobby, currentLobby, isLoading, error, clearError } = useLobby();
    const { showPopup } = usePopup();
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [joinCodeParts, setJoinCodeParts] = useState(['', '', '', '', '', '']);
    const [showNewLobbyModal, setShowNewLobbyModal] = useState(false);
    const [newLobbyName, setNewLobbyName] = useState('');

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

    const handleCreateLobby = () => {
        createLobby(minPlayers, false, newLobbyName || undefined, gameName);
        setShowNewLobbyModal(false);
        setNewLobbyName('');
    };

    const handleLobbyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^a-zA-Z0-9-_]/g, '').slice(0, 25);
        setNewLobbyName(value);
    };

    const handlePartChange = (index: number, value: string | string[]) => {
        if (index === -1 && Array.isArray(value)) {
            const updatedParts = [...joinCodeParts];
            value.forEach((char, i) => {
                if (i < updatedParts.length) {
                    updatedParts[i] = char;
                }
            });
            setJoinCodeParts(updatedParts);
        } else if (typeof value === "string") {
            const updatedParts = [...joinCodeParts];
            updatedParts[index] = value;
            setJoinCodeParts(updatedParts);
        }
    };

    const handleConfirmJoin = () => {
        const joinCode = joinCodeParts.join('');
        joinLobby(joinCode);
        setShowJoinModal(false);
        setJoinCodeParts(['', '', '', '', '', '']);
    };

    const isJoinCodeComplete = joinCodeParts.every((part) => part !== '');

    useEffect(() => {
        if (error) {
            showPopup({
                type: 'error',
                message: error.message,
            });
            clearError();
        }
    }, [error, clearError, showPopup]);

    useEffect(() => {
        if (currentLobby) {
            navigate(`/lobby`);
        }
    }, [currentLobby, navigate]);

    return (
        <div className="game-header flex flex-wrap w-full py-4 gap-4 items-center sm:flex-nowrap">
            <div className="game-header-icon w-full sm:w-auto flex justify-center sm:mr-4">
                <img src={path} alt={`${title} icon`} style={{ maxWidth: '150px', maxHeight: '150px' }} />
            </div>
            <div className="bg-background-secondary w-full h-auto p-6 rounded-lg flex flex-wrap items-center justify-center gap-4 sm:justify-between text-center mx-auto flex-col sm:flex-row min-w-[290px]">
                <div className="game-header-details max-w-[250px] mx-auto">
                    <h1 className="game-header-title text-3xl font-bold text-headline">{title}</h1>
                    <p className="game-header-info text-paragraph">
                        Minimum number of players: {minPlayers}
                        <br />
                        Maximum number of players: {maxPlayers}
                        <br />
                    </p>
                </div>
                <div className="game-header-actions mt-4 sm:mt-0 flex flex-wrap gap-3 justify-center mx-auto">
                    <button
                        className="game-header-btn text-highlight border border-highlight rounded-lg flex items-center justify-center gap-1 w-30 h-15 transform transition-transform duration-200 hover:scale-110 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleJoinClick}
                        disabled={isLoading}
                    >
                        <FaLink /> Join
                    </button>
                    <button
                        className="game-header-btn text-highlight border border-highlight rounded-lg flex items-center justify-center gap-1 w-30 h-15 transform transition-transform duration-200 hover:scale-110 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleNewLobbyClick}
                        disabled={isLoading}
                    >
                        <FaPlus /> New Lobby
                    </button>
                </div>
            </div>

            {showJoinModal && (
                <div
                    className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 px-2 sm:px-0"
                    style={{ backdropFilter: 'blur(8px)' }}
                    onClick={handleCloseModal}
                >
                    <div
                        className="bg-background p-4 sm:p-6 rounded-lg shadow-lg text-center max-w-md w-full"
                        style={{
                            outline: '2px solid var(--color-highlight)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-highlight text-lg sm:text-xl font-bold mb-3 sm:mb-4">Enter Join Code</h2>
                        <p className="text-paragraph text-sm sm:text-base mb-3 sm:mb-4">Please enter the join code to proceed.</p>
                        <div className="flex justify-center items-center gap-2 mb-3 sm:mb-4">
                            <JoinCodeInput
                                joinCodeParts={joinCodeParts}
                                onPartChange={handlePartChange}
                                isDisabled={isLoading}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mb-3 sm:mb-4">Format: XXX-XXX (6 alphanumeric characters)</p>
                        <div className="flex justify-center gap-3 sm:gap-4">
                            <button
                                onClick={handleConfirmJoin}
                                className={`px-3 sm:px-4 py-2 rounded transform transition-transform duration-200 text-sm sm:text-base ${
                                    isJoinCodeComplete && !isLoading
                                        ? 'bg-highlight text-white cursor-pointer hover:scale-105'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                                disabled={!isJoinCodeComplete || isLoading}
                            >
                                {isLoading ? 'Joining...' : 'Confirm'}
                            </button>
                            <button
                                onClick={handleCloseModal}
                                className="px-3 sm:px-4 py-2 bg-gray-300 text-black rounded transform transition-transform duration-200 hover:scale-105 disabled:opacity-50 text-sm sm:text-base"
                                disabled={isLoading}
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
                        <p className="text-paragraph mb-4">Lobby will be created for {maxPlayers} players.</p>
                        <div className="mb-4">
                            <label className="block text-paragraph text-sm mb-2">Lobby Name (Optional)</label>
                            <input
                                type="text"
                                value={newLobbyName}
                                onChange={handleLobbyNameChange}
                                placeholder="Enter lobby name..."
                                className="w-full px-3 py-2 rounded bg-background-secondary text-highlight border border-gray-400"
                            />
                        </div>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={handleCreateLobby}
                                disabled={isLoading}
                                className={`px-4 py-2 rounded transform transition-transform duration-200 ${
                                    !isLoading
                                        ? 'bg-highlight text-white cursor-pointer hover:scale-105'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                {isLoading ? 'Creating...' : 'Create'}
                            </button>
                            <button
                                onClick={() => setShowNewLobbyModal(false)}
                                disabled={isLoading}
                                className="px-4 py-2 bg-gray-300 text-black rounded transform transition-transform duration-200 hover:scale-105 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GameHeader;
