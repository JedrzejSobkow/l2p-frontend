import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../components/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getCurrentLobby, leaveLobby, connectLobbySocket, disconnectLobbySocket, reconnectLobbySocket, emitToggleReady, emitTransferHost, emitKickMember, emitUpdateSettings, onMemberReadyChanged, offMemberReadyChanged, onHostTransferred, offHostTransferred, onMemberKicked, offMemberKicked, onKickedFromLobby, offKickedFromLobby, onSettingsUpdated, offSettingsUpdated, getLobbySocket, type CurrentLobbyResponse, type MemberReadyChangedEvent } from '../services/lobby';
import InLobbyUserTile from '../components/InLobbyUserTile';
import InviteToLobbyUserTile from '../components/InviteToLobbyUserTile';
import Setting from '../components/Setting';
import LobbyChat from '../components/LobbyChat';
import EditLobbyNameModal from '../components/EditLobbyNameModal';
import GameInfoModal from '../components/GameInfoModal';
import CatalogueModal from '../components/CatalogueModal';
import PassHostModal from '../components/PassHostModal';
import LeaveModal from '../components/LeaveModal';
import { FaRegEdit, FaSignOutAlt } from 'react-icons/fa';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { FaRegFolderOpen } from 'react-icons/fa6';
import { LuTimer, LuUsers } from 'react-icons/lu';
import { FiLock } from 'react-icons/fi';

const LobbyScreen: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const myUsername = user?.nickname || "Unknown";

    const [lobbyData, setLobbyData] = useState<CurrentLobbyResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [messages, setMessages] = useState<{ username: string; text: string }[]>([]);
    const [selectedPlayerCount, setSelectedPlayerCount] = useState(6);
    const [isReady, setIsReady] = useState(false);

    // Initialize lobby data from REST API
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const lobby = await getCurrentLobby();
                if (!cancelled) {
                    setLobbyData(lobby);
                    setSelectedPlayerCount(lobby.max_players);
                    const currentUser = lobby.members.find(m => m.nickname === myUsername);
                    if (currentUser) {
                        setIsReady(currentUser.is_ready);
                    }
                    setLoading(false);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : 'Failed to load lobby');
                    setLoading(false);
                }
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [myUsername]);

    // Connect to Socket.IO and set up event listeners
    useEffect(() => {
        if (!user) {
            disconnectLobbySocket();
            return;
        }

        // Always disconnect and reconnect to ensure fresh connection
        disconnectLobbySocket();
        const socket = connectLobbySocket();

        let isMounted = true;

        const handleConnect = () => {
            console.log('Connected to lobby namespace');
            if (isMounted) {
                setError(null);
            }
        };

        const handleDisconnect = (reason: string) => {
            console.log('Disconnected from lobby namespace:', reason);
        };

        const handleError = (error: any) => {
            console.error('Lobby socket error:', error);
            if (isMounted) {
                setError(`Connection error: ${error?.message || 'Unknown error'}`);
            }
        };

        const handleConnectError = (error: any) => {
            console.error('Lobby socket connection error:', error);
            if (isMounted) {
                if (error?.message?.includes('Authentication') || error?.message === 'Auth error') {
                    setError('Authentication failed. Reconnecting...');
                    // Force a hard refresh of the connection
                    setTimeout(() => {
                        if (socket && !socket.connected) {
                            socket.connect();
                        }
                    }, 2000);
                }
            }
        };

        const handleMemberReadyChanged = (data: MemberReadyChangedEvent) => {
            console.log('Member ready changed:', data);
            if (isMounted) {
                setLobbyData(prevLobbyData => {
                    if (!prevLobbyData) return null;
                    return {
                        ...prevLobbyData,
                        members: prevLobbyData.members.map(member =>
                            member.user_id === data.user_id
                                ? { ...member, is_ready: data.is_ready }
                                : member
                        )
                    };
                });
            }
        };

        const handleHostTransferred = (data: any) => {
            console.log('Host transferred:', data);
            if (isMounted) {
                setLobbyData(prevLobbyData => {
                    if (!prevLobbyData) return null;
                    return {
                        ...prevLobbyData,
                        host_id: data.new_host_id,
                        members: prevLobbyData.members.map(member =>
                            member.user_id === data.new_host_id
                                ? { ...member, is_host: true }
                                : member.user_id === data.old_host_id
                                ? { ...member, is_host: false }
                                : member
                        )
                    };
                });
            }
        };

        const handleMemberKicked = (data: any) => {
            console.log('Member kicked:', data);
            if (isMounted) {
                // Check if current user was kicked
                if (data.user_id === user?.id) {
                    disconnectLobbySocket();
                    setError(null);
                    navigate('/');
                    console.log('KICKED OUT');
                    return;
                }
                
                setLobbyData(prevLobbyData => {
                    if (!prevLobbyData) return null;
                    return {
                        ...prevLobbyData,
                        members: prevLobbyData.members.filter(member => member.user_id !== data.user_id),
                        current_players: prevLobbyData.current_players - 1
                    };
                });
            }
        };

        const handleKickedFromLobby = (data: any) => {
            console.log('Kicked from lobby:', data);
            if (isMounted) {
                disconnectLobbySocket();
                navigate('/', { state: { message: 'You have been kicked from the lobby', type: 'error' } });
            }
        };

        const handleSettingsUpdated = (data: any) => {
            console.log('Settings updated:', data);
            if (isMounted) {
                setLobbyData(prevLobbyData => {
                    if (!prevLobbyData) return null;
                    return {
                        ...prevLobbyData,
                        max_players: data.max_players
                    };
                });
                setSelectedPlayerCount(data.max_players);
            }
        };

        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);
        socket.on('error', handleError);
        socket.on('connect_error', handleConnectError);
        onMemberReadyChanged(handleMemberReadyChanged);
        onHostTransferred(handleHostTransferred);
        onMemberKicked(handleMemberKicked);
        onKickedFromLobby(handleKickedFromLobby);
        onSettingsUpdated(handleSettingsUpdated);

        return () => {
            isMounted = false;
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
            socket.off('error', handleError);
            socket.off('connect_error', handleConnectError);
            offMemberReadyChanged(handleMemberReadyChanged);
            offHostTransferred(handleHostTransferred);
            offMemberKicked(handleMemberKicked);
            offKickedFromLobby(handleKickedFromLobby);
            offSettingsUpdated(handleSettingsUpdated);
        };
    }, [user, navigate]);

    // Handle visibility/focus changes
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                // Tab became visible, reconnect
                console.log('Tab regained focus, reconnecting socket...');
                reconnectLobbySocket();
            }
        };

        const handleFocus = () => {
            // Window regained focus
            console.log('Window regained focus, reconnecting socket...');
            reconnectLobbySocket();
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    const handleSendMessage = (message: string) => {
        setMessages((prev) => [...prev, { username: "You", text: message }]);
    };

    const isUserHost = lobbyData?.members.some(u => u.nickname === myUsername && u.is_host) || false;

    const toggleReady = async () => {
        try {
            if (lobbyData?.lobby_code) {
                emitToggleReady(lobbyData.lobby_code);
                setIsReady((prev) => !prev);
                setLobbyData(prevLobbyData => {
                    if (!prevLobbyData) return null;
                    return {
                        ...prevLobbyData,
                        members: prevLobbyData.members.map(member =>
                            member.nickname === myUsername
                                ? { ...member, is_ready: !member.is_ready }
                                : member
                        )
                    };
                });
            }
        } catch (err) {
            console.error('Failed to toggle ready status:', err);
            setError(err instanceof Error ? err.message : 'Failed to toggle ready status');
            setIsReady((prev) => !prev);
        }
    };

    const handleUpdatePlayerCount = (newPlayerCount: number) => {
        if (!lobbyData?.lobby_code) return;
        try {
            emitUpdateSettings(lobbyData.lobby_code, newPlayerCount);
            setSelectedPlayerCount(newPlayerCount);
        } catch (err) {
            console.error('Failed to update player count:', err);
            setError(err instanceof Error ? err.message : 'Failed to update player count');
        }
    };

    const lobbySettings = [
        {
            label: "Visibility",
            icon: <FiLock size={20} />,
            availableValues: ["Private", "Public"],
            defaultValue: "Private",
        },
    ];

    const gameSettings = [
        {
            label: "Players",
            icon: <LuUsers size={20} />,
            availableValues: ["2", "4", "6"],
            defaultValue: "6",
        },
        {
            label: "Game time [min]",
            icon: <LuTimer size={20} />,
            availableValues: ["2", "4", "6", "8"],
            defaultValue: "6",
        },
    ];

    const [isEditingLobbyName, setIsEditingLobbyName] = useState(false);
    const [editedLobbyName, setEditedLobbyName] = useState(lobbyData?.name || "");
    const [isShowingGameInfo, setIsShowingGameInfo] = useState(false);
    const [isShowingCatalogue, setIsShowingCatalogue] = useState(false);

    const mockGames = [
        { gameName: 'Tic Tac Toe', src: '/src/assets/images/tic-tac-toe.png', supportedPlayers: [2, 3, 4] },
        { gameName: 'Clobber', src: '/src/assets/images/clobber.png', supportedPlayers: [2, 3, 4, 5, 6] },
        { gameName: 'Chess', src: '/src/assets/images/clobber.png', supportedPlayers: [2] },
        { gameName: 'Checkers', src: '/src/assets/images/clobber.png', supportedPlayers: [2, 3, 4, 5] },
        { gameName: 'Sudoku', src: '/src/assets/images/clobber.png', supportedPlayers: [1, 2, 3, 4, 5, 6, 7, 8] },
        { gameName: 'Minesweeper', src: '/src/assets/images/clobber.png', supportedPlayers: [1, 2, 3, 4] },
    ];

    const currentPlayerCount = lobbyData?.current_players ?? 0;

    const isGameAvailable = (supportedPlayers: number[]) => {
        return supportedPlayers.includes(currentPlayerCount);
    };

    const disabledPlayerCounts = gameSettings[0].availableValues.filter(
        value => parseInt(value) < currentPlayerCount
    );

    const allUsersReady = lobbyData?.members.every(user => 
        user.nickname === myUsername ? isReady : user.is_ready
    ) || false;

    const canStartGame = isUserHost && allUsersReady && currentPlayerCount === selectedPlayerCount;

    const handleSaveLobbyName = (newName: string) => {
        setEditedLobbyName(newName);
        setIsEditingLobbyName(false);
    };

    const handlePassHost = async (newHostUsername: string) => {
        try {
            const newHostUser = lobbyData?.members.find(u => u.nickname === newHostUsername);
            if (newHostUser && lobbyData?.lobby_code) {
                emitTransferHost(lobbyData.lobby_code, newHostUser.user_id);
            }
        } catch (err) {
            console.error('Failed to transfer host:', err);
            setError(err instanceof Error ? err.message : 'Failed to transfer host');
        }
    };

    const handleKickOut = (usernameToRemove: string) => {
        try {
            const userToKick = lobbyData?.members.find(u => u.nickname === usernameToRemove);
            if (userToKick && lobbyData?.lobby_code) {
                emitKickMember(lobbyData.lobby_code, userToKick.user_id);
            }
        } catch (err) {
            console.error('Failed to kick member:', err);
            setError(err instanceof Error ? err.message : 'Failed to kick member');
        }
    };

    const [passHostUsername, setPassHostUsername] = useState<string>("");
    const [isPassHostModalOpen, setIsPassHostModalOpen] = useState(false);

    const handlePassHostClick = (username: string) => {
        setPassHostUsername(username);
        setIsPassHostModalOpen(true);
    };

    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

    const handleLeaveClick = () => {
        setIsLeaveModalOpen(true);
    };

    const handleConfirmLeave = async () => {
        try {
            if (lobbyData?.lobby_code) {
                await leaveLobby(lobbyData.lobby_code);
                setIsLeaveModalOpen(false);
                navigate('/');
            }
        } catch (err) {
            console.error('Failed to leave lobby:', err);
            setError(err instanceof Error ? err.message : 'Failed to leave lobby');
        }
    };

    const users = lobbyData?.members.map((member) => ({
        avatar: `/src/assets/images/avatar/${member.user_id % 15 + 1}.png`,
        username: member.nickname,
        place: 0,
        isReady: member.is_ready ?? false,
        isHost: member.is_host,
    })) ?? [];

    users.forEach((user, index) => {
        user.place = index + 1;
    });

    const defaultGameInfo = {
        name: "Game",
        img_path: "",
        rules: ""
    };
    const gameInfo = lobbyData?.game || defaultGameInfo;

    if (loading) {
        return (
            <main className="flex items-center justify-center min-h-screen bg-background-primary">
                <div className="text-headline text-xl">Loading lobby...</div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="flex items-center justify-center min-h-screen bg-background-primary">
                <div className="text-red-500 text-xl">{error}</div>
            </main>
        );
    }

    return (
        <main className="flex flex-col bg-background-primary min-h-screen">
            {/* Top Bar with Leave Button */}
            <div className="flex justify-start px-4 sm:px-6 lg:px-8 pt-4 pb-2">
                <button
                    onClick={handleLeaveClick}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-600 text-white font-bold text-sm sm:text-base rounded-lg hover:bg-red-700 hover:scale-105 transition-transform focus:outline-none"
                >
                    <FaSignOutAlt size={20} />
                    <span className="hidden sm:inline">Leave</span>
                </button>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8 flex-1 overflow-auto">
                {/* First Column: Players and chat */}
                <div className="flex flex-col items-center gap-3 sm:gap-4">
                    <div className="w-full flex items-center justify-between p-3 sm:p-4 bg-background-secondary rounded-lg shadow-md">
                        <span className="text-base sm:text-lg font-bold text-white truncate">{editedLobbyName}</span>
                        <button 
                            disabled={!isUserHost}
                            onClick={() => setIsEditingLobbyName(true)}
                            className="focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform cursor-pointer ml-2 flex-shrink-0"
                        >
                            <FaRegEdit className="text-highlight" size={24} />
                        </button>
                    </div>

                    <div className="w-full grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4 p-3 sm:p-4 bg-background-secondary rounded-lg shadow-md">
                        {users.map((user, index) => (
                            <InLobbyUserTile
                                key={index}
                                avatar={user.avatar}
                                username={user.username}
                                place={user.place}
                                isReady={user.username === myUsername ? isReady : user.isReady}
                                isHost={user.isHost}
                                isYou={myUsername === user.username}
                                displayPassHost={myUsername !== user.username && users.some(u => u.username === myUsername && u.isHost)}
                                displayKickOut={myUsername !== user.username && users.some(u => u.username === myUsername && u.isHost)}
                                onPassHost={() => handlePassHostClick(user.username)}
                                onKickOut={() => handleKickOut(user.username)}
                            />
                        ))}
                        {/* Add empty seats */}
                        {Array.from({ length: selectedPlayerCount - currentPlayerCount }).map((_, index) => (
                            <InviteToLobbyUserTile key={`empty-${index}`} onInviteClick={() => console.log('Invite clicked')} />
                        ))}
                    </div>

                    {/* Action Buttons Section - visible on mobile */}
                    <div className="w-full lg:hidden p-3 sm:p-4 rounded-lg shadow-md flex flex-col items-center justify-center gap-3">
                        {/* Ready Button */}
                        <button
                            onClick={toggleReady}
                            className={`w-full px-4 py-2 text-white font-bold text-sm rounded-lg focus:outline-none ${isReady ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                                }`}
                        >
                            {isReady ? 'Ready' : 'Not Ready'}
                        </button>

                        {/* Start Button */}
                        <button disabled={!canStartGame} className="w-full px-4 py-2 bg-blue-500 text-white font-bold text-sm rounded-lg hover:bg-blue-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-500">
                            Start
                        </button>
                    </div>

                    {/* Chat Section */}
                    <div className="w-full bg-background-secondary rounded-lg shadow-md p-3 sm:p-4">
                        <h3 className="text-base sm:text-lg font-bold text-white mb-2">Chat</h3>
                        <LobbyChat messages={messages} onSendMessage={handleSendMessage} />
                    </div>
                </div>

                {/* Second Column: Game Info */}
                <div className="flex flex-col gap-3 sm:gap-4">
                    <div className="w-full flex items-center justify-between gap-2 p-3 sm:p-4 bg-background-secondary rounded-lg shadow-md">
                        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                            <img
                                src={gameInfo.img_path || ""}
                                alt={`${gameInfo.name} image`}
                                className="h-5 sm:h-7 w-auto flex-shrink-0"
                            />
                            <span className="text-sm sm:text-lg font-bold text-white truncate">{gameInfo.name}</span>
                        </div>

                        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                            <button 
                                onClick={() => setIsShowingGameInfo(true)}
                                className="focus:outline-none hover:scale-105 transition-transform cursor-pointer p-1"
                            >
                                <AiOutlineInfoCircle className="text-highlight" size={24} />
                            </button>
                            <button 
                                disabled={!isUserHost}
                                onClick={() => setIsShowingCatalogue(true)}
                                className="focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform cursor-pointer p-1"
                            >
                                <FaRegFolderOpen className="text-highlight" size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Settings Section */}
                    <div className="w-full p-3 sm:p-4 bg-background-secondary rounded-lg shadow-md overflow-y-auto max-h-96 lg:max-h-none">
                        {/* Lobby Settings */}
                        <div className="mb-3 sm:mb-4">
                            <h3 className="text-base sm:text-lg font-bold text-white mb-2">Lobby Settings</h3>
                            <div className="flex flex-col gap-y-2">
                                {lobbySettings.map((setting, index) => (
                                    <Setting
                                        key={index}
                                        label={setting.label}
                                        icon={setting.icon}
                                        availableValues={setting.availableValues}
                                        defaultValue={setting.defaultValue}
                                        disabled={!isUserHost}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Game Settings */}
                        <div>
                            <h3 className="text-base sm:text-lg font-bold text-white mb-2">Game Settings</h3>
                            <div className="flex flex-col gap-y-2">
                                {gameSettings.map((setting, index) => (
                                    <Setting
                                        key={`${index}-${index === 0 ? selectedPlayerCount : 'static'}`}
                                        label={setting.label}
                                        icon={setting.icon}
                                        availableValues={setting.availableValues}
                                        defaultValue={index === 0 ? String(selectedPlayerCount) : setting.defaultValue}
                                        disabled={!isUserHost}
                                        disabledValues={index === 0 ? disabledPlayerCounts : []}
                                        onChange={index === 0 ? (value) => handleUpdatePlayerCount(parseInt(value)) : undefined}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons Section - visible on desktop */}
                    <div className="hidden lg:flex w-full p-3 sm:p-4 rounded-lg shadow-md flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                        {/* Ready Button */}
                        <button
                            onClick={toggleReady}
                            className={`w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-white font-bold text-sm sm:text-base rounded-lg focus:outline-none ${isReady ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                                }`}
                        >
                            {isReady ? 'Ready' : 'Not Ready'}
                        </button>

                        {/* Start Button */}
                        <button disabled={!canStartGame} className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-blue-500 text-white font-bold text-sm sm:text-base rounded-lg hover:bg-blue-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-500">
                            Start
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <EditLobbyNameModal
                isOpen={isEditingLobbyName}
                currentName={editedLobbyName}
                onSave={handleSaveLobbyName}
                onCancel={() => setIsEditingLobbyName(false)}
            />

            <GameInfoModal
                isOpen={isShowingGameInfo}
                gameName={gameInfo.name}
                gameRules={gameInfo.rules}
                onClose={() => setIsShowingGameInfo(false)}
            />

            <CatalogueModal
                isOpen={isShowingCatalogue}
                games={mockGames}
                currentPlayerCount={currentPlayerCount}
                onClose={() => setIsShowingCatalogue(false)}
            />

            <PassHostModal
                username={passHostUsername}
                isOpen={isPassHostModalOpen}
                onConfirm={() => {
                    handlePassHost(passHostUsername);
                    setIsPassHostModalOpen(false);
                }}
                onCancel={() => setIsPassHostModalOpen(false)}
            />

            <LeaveModal
                isOpen={isLeaveModalOpen}
                onConfirm={handleConfirmLeave}
                onCancel={() => setIsLeaveModalOpen(false)}
            />
        </main>
    );
}

export default LobbyScreen;
