import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../components/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    getCurrentLobby, leaveLobby, connectLobbySocket, disconnectLobbySocket, reconnectLobbySocket, emitToggleReady, emitTransferHost, emitKickMember, emitUpdateSettings, emitLeaveLobby, emitUpdateVisibility, emitJoinLobby, onMemberReadyChanged, offMemberReadyChanged, onHostTransferred, offHostTransferred, onMemberKicked, offMemberKicked, onKickedFromLobby, offKickedFromLobby, onSettingsUpdated, offSettingsUpdated, onMemberLeft, offMemberLeft, onLobbyLeft, offLobbyLeft, getLobbySocket, 
    emitSendLobbyMessage, emitLobbyTyping, emitGetLobbyMessages, onLobbyMessage, offLobbyMessage, onLobbyUserTyping, offLobbyUserTyping, onLobbyMessagesHistory, offLobbyMessagesHistory,
    type CurrentLobbyResponse, type MemberReadyChangedEvent, type LobbyMessageEvent, type LobbyUserTypingEvent 
} from '../services/lobby';
import InLobbyUserTile from '../components/InLobbyUserTile';
import InviteToLobbyUserTile from '../components/InviteToLobbyUserTile';
import Setting from '../components/Setting';
import LobbyChat from '../components/LobbyChat';
import EditLobbyNameModal from '../components/EditLobbyNameModal';
import GameInfoModal from '../components/GameInfoModal';
import CatalogueModal from '../components/CatalogueModal';
import PassHostModal from '../components/PassHostModal';
import LeaveModal from '../components/LeaveModal';
import InviteFriendsModal from '../components/InviteFriendsModal';
import { FaRegEdit, FaSignOutAlt } from 'react-icons/fa';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { FaRegFolderOpen } from 'react-icons/fa6';
import { LuTimer, LuUsers } from 'react-icons/lu';
import { FiLock } from 'react-icons/fi';
import { useChat } from '../components/chat/ChatProvider';
import { connectGameSocket, emitCreateGame, onGameStarted as onGameStartedEvt, offGameStarted as offGameStartedEvt, onGameError as onGameErrorEvt, offGameError as offGameErrorEvt, onGameState as onGameStateEvt, offGameState as offGameStateEvt, emitGetGameState, onGameEnded as onGameEndedEvt, offGameEnded as offGameEndedEvt } from '../services/game';
import LobbyGameScreen from './LobbyGameScreen';

// Extend Window interface to include custom properties
declare global {
    interface Window {
        __reloadKeys?: {
            ctrlR?: boolean;
            f5?: boolean;
        };
    }
}


type AutoGameStartListenerProps = { lobbyCode: string; onStarted: () => void; onEnded: () => void }
const AutoGameStartListener: React.FC<AutoGameStartListenerProps> = ({ lobbyCode, onStarted, onEnded }) => {
    React.useEffect(() => {
        connectGameSocket();
        const handleStarted = () => onStarted();
        const handleState = (ev: any) => {
            const result = ev?.game_state?.result;
            if (result === 'in_progress') onStarted();
            else if (result && result !== 'in_progress') onEnded();
        };
        const handleEnded = () => onEnded();
        onGameStartedEvt(handleStarted);
        onGameStateEvt(handleState);
        onGameEndedEvt(handleEnded);
        // ask for state in case game already exists
        try { emitGetGameState(); } catch {}
        return () => {
            offGameStartedEvt(handleStarted);
            offGameStateEvt(handleState);
            offGameEndedEvt(handleEnded);
        };
    }, [lobbyCode, onStarted, onEnded]);
    return null;
};
const LobbyScreen: React.FC = () => {
    const [isInGame, setIsInGame] = useState(false);

    const { user } = useAuth();
    const navigate = useNavigate();
    const { lobbyCode: urlLobbyCode } = useParams<{ lobbyCode?: string }>();
    const myUsername = user?.nickname || "Unknown";
    const chat = useChat();

    const [lobbyData, setLobbyData] = useState<CurrentLobbyResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isJoiningFromUrl, setIsJoiningFromUrl] = useState(false);

    const [messages, setMessages] = useState<{ username: string; text: string }[]>([]);
    const [typingUsers, setTypingUsers] = useState<string[]>([]);
    const typingTimeoutRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

    const [selectedPlayerCount, setSelectedPlayerCount] = useState(6);
    const [isReady, setIsReady] = useState(false);
    const [isPublic, setIsPublic] = useState(lobbyData?.is_public || false);

    // Initialize lobby data from REST API or join from URL
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                // First, try to get current lobby
                const lobby = await getCurrentLobby();
                if (!cancelled) {
                    // User is already in a lobby
                    if (urlLobbyCode && lobby.lobby_code.toUpperCase() === urlLobbyCode.toUpperCase()) {
                        // Already in the target lobby, just show it
                        setLobbyData(lobby);
                        setSelectedPlayerCount(lobby.max_players);
                        setIsPublic(lobby.is_public);
                        const currentUser = lobby.members.find(m => m.nickname === myUsername);
                        if (currentUser) {
                            setIsReady(currentUser.is_ready);
                        }
                        setLoading(false);
                        // Redirect to clean lobby URL
                        navigate('/lobby', { replace: true });
                    } else if (urlLobbyCode) {
                        // User is in a different lobby, show error
                        setLoading(false);
                        navigate('/', { 
                            replace: true,
                            state: { 
                                message: 'You are already in another lobby. Please leave it first.', 
                                type: 'error' 
                            } 
                        });
                    } else {
                        // No URL lobby code, just show current lobby
                        setLobbyData(lobby);
                        setSelectedPlayerCount(lobby.max_players);
                        setIsPublic(lobby.is_public);
                        const currentUser = lobby.members.find(m => m.nickname === myUsername);
                        if (currentUser) {
                            setIsReady(currentUser.is_ready);
                        }
                        setLoading(false);
                    }
                }
            } catch (err) {
                if (!cancelled) {
                    // User is not in any lobby
                    if (urlLobbyCode) {
                        // Try to join the lobby from URL
                        setIsJoiningFromUrl(true);
                        const socket = connectLobbySocket();
                        
                        // Wait for socket to connect
                        const waitForConnection = new Promise<void>((resolve) => {
                            if (socket.connected) {
                                resolve();
                            } else {
                                socket.once('connect', () => resolve());
                            }
                        });

                        try {
                            await waitForConnection;
                            
                            emitJoinLobby(
                                urlLobbyCode.toUpperCase(),
                                (joinedLobby) => {
                                    if (!cancelled) {
                                        setLobbyData(joinedLobby);
                                        setSelectedPlayerCount(joinedLobby.max_players);
                                        setIsPublic(joinedLobby.is_public);
                                        const currentUser = joinedLobby.members.find(m => m.nickname === myUsername);
                                        if (currentUser) {
                                            setIsReady(currentUser.is_ready);
                                        }
                                        setLoading(false);
                                        setIsJoiningFromUrl(false);
                                        // Redirect to clean lobby URL
                                        navigate('/lobby', { replace: true });
                                    }
                                },
                                (errorMsg) => {
                                    if (!cancelled) {
                                        setLoading(false);
                                        setIsJoiningFromUrl(false);
                                        disconnectLobbySocket();
                                        navigate('/', { 
                                            replace: true,
                                            state: { 
                                                message: `Failed to join lobby: ${errorMsg}`, 
                                                type: 'error' 
                                            } 
                                        });
                                    }
                                }
                            );
                        } catch (joinErr) {
                            if (!cancelled) {
                                setLoading(false);
                                setIsJoiningFromUrl(false);
                                disconnectLobbySocket();
                                navigate('/', { 
                                    replace: true,
                                    state: { 
                                        message: 'Failed to connect to lobby server.', 
                                        type: 'error' 
                                    } 
                                });
                            }
                        }
                    } else {
                        // No URL lobby code and not in any lobby
                        setLoading(false);
                        navigate('/', { 
                            replace: true,
                            state: { 
                                message: 'You are not in any lobby.', 
                                type: 'error' 
                            } 
                        });
                    }
                }
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [myUsername, urlLobbyCode, navigate]);

    // Connect to Socket.IO and set up event listeners
    useEffect(() => {
        if (!user || isJoiningFromUrl) {
            return;
        }

        // Only set up socket listeners if we're not joining from URL
        if (!lobbyData) {
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
                    navigate('/', { state: { message: 'You have been kicked from the lobby', type: 'error' } });
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
                    if (!prevLobbyData) return prevLobbyData;
                    return {
                        ...prevLobbyData,
                        max_players: data.max_players ?? prevLobbyData.max_players,
                        is_public: data.is_public ?? prevLobbyData.is_public,
                    };
                });
                if (data.is_public !== undefined && data.is_public !== null) {
                    setIsPublic(data.is_public);
                }
                if (data.max_players !== undefined && data.max_players !== null) {
                    setSelectedPlayerCount(data.max_players);
                }
            }
        };

        const handleMemberLeft = (data: any) => {
            console.log('Member left:', data);
            if (isMounted) {
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

        const handleLobbyLeft = (data: any) => {
            console.log('Successfully left lobby');
            if (isMounted) {
                disconnectLobbySocket();
                navigate('/');
            }
        };

        const handleMemberJoined = (data: any) => {
            console.log('New member joined:', data);
            if (isMounted) {
                setLobbyData((prevLobbyData) => {
                    if (!prevLobbyData) return null;
                    return {
                        ...prevLobbyData,
                        members: [...prevLobbyData.members, data.member],
                        current_players: data.current_players,
                    };
                });
            }
        };

        const handleLobbyMessage = (data: LobbyMessageEvent) => {
            console.log('Received lobby message:', data);
            if (isMounted) {
                setMessages((prev) => [...prev, {
                    username: data.nickname,
                    text: data.content
                }]);
            }
        };

        const handleLobbyUserTyping = (data: LobbyUserTypingEvent) => {
            console.log('User typing:', data);
            if (isMounted && data.user_id !== user?.id) {
                setTypingUsers((prev) => {
                    if (!prev.includes(data.nickname)) {
                        return [...prev, data.nickname];
                    }
                    return prev;
                });

                // Clear existing timeout for this user
                const existingTimeout = typingTimeoutRef.current.get(data.user_id);
                if (existingTimeout) {
                    clearTimeout(existingTimeout);
                }

                // Set new timeout to remove typing indicator
                const timeout = setTimeout(() => {
                    setTypingUsers((prev) => prev.filter(name => name !== data.nickname));
                    typingTimeoutRef.current.delete(data.user_id);
                }, 3000);

                typingTimeoutRef.current.set(data.user_id, timeout);
            }
        };

        const handleLobbyMessagesHistory = (data: { messages: LobbyMessageEvent[], lobby_code: string, total: number }) => {
            console.log('Received lobby messages history:', data);
            if (isMounted && data.lobby_code === lobbyData.lobby_code) {
                setMessages(data.messages.map(msg => ({
                    username: msg.nickname,
                    text: msg.content
                })));
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
        onMemberLeft(handleMemberLeft);
        onLobbyLeft(handleLobbyLeft);
        socket.on('member_joined', handleMemberJoined);
        onLobbyMessage(handleLobbyMessage);
        onLobbyUserTyping(handleLobbyUserTyping);
        onLobbyMessagesHistory(handleLobbyMessagesHistory);

        // Request message history once connected
        if (socket.connected && lobbyData?.lobby_code) {
            emitGetLobbyMessages(lobbyData.lobby_code);
        } else {
            socket.once('connect', () => {
                if (lobbyData?.lobby_code) {
                    emitGetLobbyMessages(lobbyData.lobby_code);
                }
            });
        }

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
            offMemberLeft(handleMemberLeft);
            offLobbyLeft(handleLobbyLeft);
            socket.off('member_joined', handleMemberJoined);
            offLobbyMessage(handleLobbyMessage);
            offLobbyUserTyping(handleLobbyUserTyping);
            offLobbyMessagesHistory(handleLobbyMessagesHistory);
            
            // Clear all typing timeouts
            typingTimeoutRef.current.forEach(timeout => clearTimeout(timeout));
            typingTimeoutRef.current.clear();
        };
    }, [user, navigate, isJoiningFromUrl, lobbyData]);

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

    // Handle leaving lobby when component unmounts (navigation away)
    useEffect(() => {
        // Mark that we're in lobby
        sessionStorage.setItem('isInLobby', 'true');
        sessionStorage.setItem('lobbyCode', lobbyData?.lobby_code || '');
        
        return () => {
            // Check if it's a page reload
            const isReloading = sessionStorage.getItem('isReloading') === 'true';
            
            if (!isReloading && lobbyData?.lobby_code) {
                // Not a reload, so user is navigating away - leave lobby
                console.log('Component unmounting (navigation), leaving lobby...');
                emitLeaveLobby(
                    lobbyData.lobby_code,
                    () => {
                        console.log('Left lobby on unmount');
                        disconnectLobbySocket();
                    },
                    (error) => {
                        console.error('Error leaving lobby on unmount:', error);
                        disconnectLobbySocket();
                    }
                );
                sessionStorage.removeItem('isInLobby');
                sessionStorage.removeItem('lobbyCode');
            } else if (isReloading) {
                console.log('Page reload detected, staying in lobby');
            }
            
            // Clear the reload flag after unmount
            sessionStorage.removeItem('isReloading');
        };
    }, [lobbyData?.lobby_code]);

    // Handle leaving lobby when tab/browser is closed (but not on reload)
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            // Try multiple methods to detect reload
            const perfEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
            const isReload = perfEntries.length > 0 && perfEntries[0].type === 'reload';
            
            // Also check if user pressed Ctrl+R or F5
            const keys = window.__reloadKeys || {};
            const isKeyboardReload = keys.ctrlR || keys.f5;
            
            if (isReload || isKeyboardReload) {
                // Mark as reloading so unmount handler knows
                console.log('Reload detected in beforeunload');
                sessionStorage.setItem('isReloading', 'true');
                return; // Don't leave lobby on reload
            }
            
            // User is closing tab/browser, leave lobby
            if (lobbyData?.lobby_code) {
                console.log('Tab/browser closing, leaving lobby...');
                emitLeaveLobby(
                    lobbyData.lobby_code,
                    () => {
                        console.log('Left lobby on tab close');
                    },
                    (error) => {
                        console.error('Error leaving lobby on tab close:', error);
                    }
                );
                disconnectLobbySocket();
                sessionStorage.removeItem('isInLobby');
                sessionStorage.removeItem('lobbyCode');
            }
        };

        // Track reload keyboard shortcuts
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!window.__reloadKeys) {
                window.__reloadKeys = {};
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                window.__reloadKeys.ctrlR = true;
                sessionStorage.setItem('isReloading', 'true');
            }
            if (e.key === 'F5') {
                window.__reloadKeys.f5 = true;
                sessionStorage.setItem('isReloading', 'true');
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (window.__reloadKeys) {
                if (e.key === 'r' || e.key === 'F5') {
                    setTimeout(() => {
                        window.__reloadKeys = {};
                    }, 100);
                }
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [lobbyData?.lobby_code]);

    const handleSendMessage = (message: string) => {
        if (lobbyData?.lobby_code && message.trim()) {
            emitSendLobbyMessage(lobbyData.lobby_code, message.trim());
        }
    };

    const handleTyping = () => {
        if (lobbyData?.lobby_code) {
            emitLobbyTyping(lobbyData.lobby_code);
        }
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

    const handleUpdateVisibility = (newVisibility: string) => {
        if (!lobbyData?.lobby_code) return;
        try {
            const isPublic = newVisibility === "Public";
            emitUpdateVisibility(lobbyData.lobby_code, isPublic);
            setIsPublic(isPublic);
        } catch (err) {
            console.error('Failed to update visibility:', err);
            setError(err instanceof Error ? err.message : 'Failed to update visibility');
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

    const allUsersReady = lobbyData?.members.every(user => user.is_ready) || false;

    const canStartGame = isUserHost && allUsersReady && currentPlayerCount === selectedPlayerCount;

    const handleStartGame = () => {
        if (!canStartGame || !lobbyData) return;
        // Connect and create the game as host — navigation handled by global listeners below
        connectGameSocket();
        const gameNameRaw = (lobbyData?.game?.name || 'tictactoe');
        const slug = String(gameNameRaw).toLowerCase().replace(/[^a-z0-9]+/g, '');
        onGameErrorEvt((err: any) => {
            console.error('Failed to start game:', err);
            setError(err?.error || 'Failed to start game');
        });
        emitCreateGame(slug);
    };

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
    const [isInviteFriendsModalOpen, setIsInviteFriendsModalOpen] = useState(false);

    const handleLeaveClick = () => {
        setIsLeaveModalOpen(true);
    };

    const handleInviteFriend = async (friendUserId: number | string, friendNickname: string) => {
        if (!lobbyData?.lobby_code) {
            console.error('No lobby code available');
            return;
        }

        try {
            const lobbyUrl = `${window.location.origin}/lobby/${lobbyData.lobby_code}`;
            const inviteMessage = `Hey! Join my game lobby with this code: ${lobbyData.lobby_code} or by this link: ${lobbyUrl}`;
            
            // Send the invite message via chat
            await chat.sendMessage(String(friendUserId), { text: inviteMessage });
            
            console.log(`Invitation sent to ${friendNickname} (${friendUserId}) for lobby ${lobbyData.lobby_code}`);
        } catch (error) {
            console.error('Failed to send lobby invitation:', error);
        }
    };

    const handleConfirmLeave = () => {
        if (!lobbyData?.lobby_code) {
            console.error('Lobby code is missing.');
            setError('Lobby code is missing.');
            return;
        }
      
        emitLeaveLobby(
            lobbyData.lobby_code,
            () => {
                console.log('Navigating to home after leaving lobby.');
                disconnectLobbySocket();
                navigate('/');
            },
            (error) => {
                console.error('Error while leaving lobby:', error);
                setError(error);
            }
        );
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
        name: "Tic-Tac-Toe",
        img_path: "/src/assets/images/tic-tac-toe.png",
        rules: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Dolorem dicta repellat nostrum et, ea, neque deleniti amet optio praesentium aspernatur blanditiis perspiciatis obcaecati vitae natus perferendis soluta impedit nemo officia? Dolores nulla hic reprehenderit, dolorum, accusamus cumque provident doloribus odio nemo dicta necessitatibus magnam rem praesentium commodi veritatis dolor suscipit." 
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
            {/* Auto-listen for game start and active game state to navigate to in-game */}
            {lobbyData && (
                <AutoGameStartListener lobbyCode={lobbyData.lobby_code} onStarted={() => setIsInGame(true)} onEnded={() => setIsInGame(false)} />
            )}
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
            {/* Main Content */}
            {isInGame && lobbyData ? (
                <div className="p-4 sm:p-6 lg:p-8 flex-1 overflow-auto">
                    <LobbyGameScreen lobby={lobbyData} />
                </div>
            ) : null}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8 flex-1 overflow-auto" style={{ display: isInGame ? "none" : undefined }}>
                {/* First Column: Players and chat */}
                <div className="flex flex-col items-center gap-3 sm:gap-4">
                    <div className="w-full flex items-center justify-between p-3 sm:p-4 bg-background-secondary rounded-lg shadow-md">
                        <span className="text-base sm:text-lg font-bold text-white truncate">
                            Lobby: {lobbyData?.lobby_code ? `${lobbyData.lobby_code.slice(0, 3)}-${lobbyData.lobby_code.slice(3)}` : 'Loading...'}
                        </span>
                        <button 
                            disabled={true}
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
                            <InviteToLobbyUserTile 
                                key={`empty-${index}`} 
                                onInviteClick={() => setIsInviteFriendsModalOpen(true)} 
                            />
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
                        <button 
                            disabled={!canStartGame} 
                            onClick={handleStartGame}
                            className="w-full px-4 py-2 bg-blue-500 text-white font-bold text-sm rounded-lg hover:bg-blue-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-500"
                        >
                            Start
                        </button>
                    </div>

                    {/* Chat Section */}
                    <div className="w-full bg-background-secondary rounded-lg shadow-md p-3 sm:p-4">
                        <h3 className="text-base sm:text-lg font-bold text-white mb-2">Chat</h3>
                        <LobbyChat 
                            messages={messages} 
                            onSendMessage={handleSendMessage}
                            onTyping={handleTyping}
                            typingUsers={typingUsers}
                        />
                    </div>
                </div>

                {/* Second Column: Game Info */}
                <div className="flex flex-col gap-3 sm:gap-4">
                    <div className="w-full flex items-center justify-between gap-2 p-3 sm:p-4 bg-background-secondary rounded-lg shadow-md">
                        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                            <img
                                src={gameInfo.img_path || "/src/assets/images/tic-tac-toe.png"}
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
                                        key={`${index}-${isPublic ? 'public' : 'private'}`}
                                        label={setting.label}
                                        icon={setting.icon}
                                        availableValues={setting.label === "Visibility" ? ["Private", "Public"] : setting.availableValues}
                                        defaultValue={setting.label === "Visibility" ? (isPublic ? "Public" : "Private") : setting.defaultValue}
                                        disabled={!isUserHost}
                                        onChange={setting.label === "Visibility" ? handleUpdateVisibility : undefined}
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
                        <button 
                            disabled={!canStartGame} 
                            onClick={handleStartGame}
                            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-blue-500 text-white font-bold text-sm sm:text-base rounded-lg hover:bg-blue-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-500"
                        >
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

            <InviteFriendsModal
                isOpen={isInviteFriendsModalOpen}
                onClose={() => setIsInviteFriendsModalOpen(false)}
                onInvite={handleInviteFriend}
                lobbyCode={lobbyData?.lobby_code || ''}
            />
        </main>
    );
}

export default LobbyScreen;










