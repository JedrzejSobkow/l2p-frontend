import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  connectLobbySocket,
  disconnectLobbySocket,
  emitCreateLobby,
  emitJoinLobby,
  emitLeaveLobby,
  emitUpdateSettings,
  emitTransferHost,
  emitGetLobby,
  emitGetPublicLobbies,
  emitKickMember,
  emitToggleReady,
  emitSendLobbyMessage,
  emitGetLobbyMessages,
  emitGetAvailableGames,
  offLobbyCreated,
  offLobbyJoined,
  offLobbyLeft,
  offLobbyState,
  offMemberJoined,
  offMemberLeft,
  offHostTransferred,
  offSettingsUpdated,
  offMemberKicked,
  offMemberReadyChanged,
  offPublicLobbies,
  offLobbyMessage,
  offLobbyMessagesHistory,
  offLobbyUserTyping,
  offKickedFromLobby,
  offLobbyError,
  offAvailableGames,
  onLobbyCreated,
  onLobbyJoined,
  onLobbyLeft,
  onLobbyState,
  onMemberJoined,
  onMemberLeft,
  onHostTransferred,
  onSettingsUpdated,
  onMemberKicked,
  onMemberReadyChanged,
  onPublicLobbies,
  onLobbyMessage,
  onLobbyMessagesHistory,
  onLobbyUserTyping,
  onKickedFromLobby,
  onLobbyError,
  onAvailableGames,
  type LobbyState,
  type LobbyMember,
  type LobbyMessage,
  type LobbyError,
  emitSelectGame,
  offGameSelected,
  onGameSelected,
  emitClearGameSelection,
  offGameSelectionCleared,
  onGameSelectionCleared,
  onGameRulesUpdated,
  offGameRulesUpdated,
  emitGetPublicLobbiesByGame,
  isLobbySocketConnected,
  emitInviteFriend,
  offLobbyInviteSent,
  onLobbyInviteSent,
} from '../../services/lobby'

import {
    emitCreateGame,
    offGameState,
    offGameEnded,
    offMoveMade,
    offGameStarted,
    onGameEnded,
    onMoveMade,
    onGameState,
    isGameSocketConnected,
    onGameStarted,
} from '../../services/game'

import { usePopup } from '../PopupContext';

type LobbyContextValue = {
  isLoading: boolean
  currentLobby: LobbyState | null
  members: LobbyMember[]
  messages: LobbyMessage[]
  typingUsers: string[]
  publicLobbies: LobbyState[]
  error: LobbyError | null
  availableGames: any[]
  gameState: any | null
  createLobby: (maxPlayers?: number, isPublic?: boolean, name?: string, gameName?: string) => void
  joinLobby: (lobbyCode: string) => void
  leaveLobby: () => void
  updateSettings: (maxPlayers: number, isPublic: boolean, lobbyName?: string) => void
  transferHost: (newHostId: number | string) => void
  kickMember: (userId: number | string) => void
  toggleReady: () => void
  sendMessage: (content: string) => void
  getMessages: (limit?: number) => void
  getPublicLobbies: () => void
  getPublicLobbiesByGame: (gameName: string) => void
  getLobbyState: () => void
  clearError: () => void
  startGame: (gameName: string) => void
  getAvailableGames: () => void
  selectGame: (gameName: string) => void
  clearGameSelection: () => void
  setGameState: (state: any) => void
  sendInvite: (friendId: string, lobbyCode: string) => void
  isLobbySocketConnected: boolean
  isGameSocketConnected: boolean
}

const LobbyContext = createContext<LobbyContextValue | undefined>(undefined)

export const LobbyProvider = ({ children }: { children: ReactNode }) => {
  const [currentLobby, setCurrentLobby] = useState<LobbyState | null>(null)
  const [members, setMembers] = useState<LobbyMember[]>([])
  const [messages, setMessages] = useState<LobbyMessage[]>([])
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [publicLobbies, setPublicLobbies] = useState<LobbyState[]>([])
  const [availableGames, setAvailableGames] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<LobbyError | null>(null)
  const [gameState, setGameState] = useState<any | null>(null)
  const { showPopup } = usePopup();

  // Initialize socket connection
  useEffect(() => {
    connectLobbySocket()
    return () => {
      // Don't disconnect on unmount, keep connection alive
    }
  }, [])

  // Setup event listeners
  useEffect(() => {
    const handleLobbyCreated = (data: { lobby_code: string }) => {
      //console('Lobby created:', data)
      setIsLoading(false)
    }

    const handleLobbyJoined = (data: { lobby: LobbyState }) => {
      //console('Lobby joined:', data)
      setCurrentLobby(data.lobby)
      setMembers(data.lobby.members)
      setMessages([])
      setIsLoading(false)
    }

    const handleLobbyLeft = () => {
      //console('Lobby left')
      setCurrentLobby(null)
      setMembers([])
      setMessages([])
      setTypingUsers([])
      setIsLoading(false)
    }

    const handleLobbyState = (data: LobbyState) => {
      //console('Lobby state:', data)
      setCurrentLobby(data)
      setMembers(data.members)
      setIsLoading(false)
    }

    const handleMemberJoined = (data: { member: LobbyMember; current_players: number }) => {
      //console('Member joined:', data)
      setMembers(prev => {
        // Sprawdź, czy użytkownik już istnieje w tablicy `members`
        const exists = prev.some(m => m.user_id === data.member.user_id);
      
        // Jeśli użytkownik już istnieje, zwróć niezmienioną tablicę
        if (exists) {
          return prev;
        }
      
        // Jeśli użytkownika nie ma, dodaj go do tablicy
        return [...prev, data.member];
      });      setCurrentLobby(prev => prev ? { ...prev, current_players: data.current_players } : null)
    }

    const handleMemberLeft = (data: { user_id: number | string; nickname: string; current_players: number }) => {
      //console('Member left:', data)
      setMembers(prev => prev.filter(m => m.user_id !== data.user_id))
      setCurrentLobby(prev => prev ? { ...prev, current_players: data.current_players } : null)
    }

    const handleHostTransferred = (data: { old_host_id: number | string; new_host_id: number | string; new_host_nickname: string }) => {
      //console('Host transferred:', data)
      setCurrentLobby(prev => prev ? { ...prev, host_id: data.new_host_id } : null)
    }

    const handleSettingsUpdated = (data: { max_players: number; is_public: boolean; name?: string }) => {
      //console('Settings updated:', data)
      setCurrentLobby(prev => prev ? { 
        ...prev, 
        max_players: data.max_players, 
        is_public: data.is_public,
        ...(data.name && { name: data.name })
      } : null)
    }

    const handleMemberKicked = (data: { user_id: number | string; nickname: string; kicked_by_id: number | string }) => {
      //console('Member kicked:', data)
      setMembers(prev => prev.filter(m => m.user_id !== data.user_id))
    }

    const handleMemberReadyChanged = (data: { user_id: number | string; nickname: string; is_ready: boolean }) => {
      //console('Member ready changed:', data)
      setMembers(prev => prev.map(m => m.user_id === data.user_id ? { ...m, is_ready: data.is_ready } : m))
    }

    const handlePublicLobbies = (data: { lobbies: LobbyState[]; total: number }) => {
      //console('Public lobbies:', data)
      setPublicLobbies(data.lobbies)
      setIsLoading(false)
    }

    const handleLobbyMessage = (data: LobbyMessage) => {
      //console('Lobby message:', data)
      setMessages(prev => [...prev, data])
    }

    const handleLobbyMessagesHistory = (data: { messages: LobbyMessage[]; lobby_code: string; total: number }) => {
      //console('Lobby messages history:', data)
      setMessages(data.messages)
    }

    const handleLobbyUserTyping = (data: { user_id: number | string; nickname: string }) => {
      //console('User typing:', data)
      setTypingUsers(prev => {
        const key = String(data.user_id)
        if (prev.includes(key)) return prev
        return [...prev, key]
      })
      setTimeout(() => {
        setTypingUsers(prev => prev.filter(id => id !== String(data.user_id)))
      }, 3000)
    }

    const handleKickedFromLobby = (data: { lobby_code: string; message: string }) => {
      //console('Kicked from lobby:', data)
      setCurrentLobby(null)
      setMembers([])
      setMessages([])
      setError({ message: data.message, error_code: 'KICKED' })
    }

    const handleLobbyError = (data: LobbyError) => {
      console.error('Lobby error:', data)
      setError(data)
      setIsLoading(false)
    }

    const handleAvailableGames = (data: { games: any[]; total: number }) => {
      //console('Available games:', data)
      setAvailableGames(data.games)
    }

    const handleGameSelected = (data: { game_name: string; game_info: any; current_rules: any; max_players?: number }) => {
      //console('Game selected:', data)
      setCurrentLobby(prev => prev ? { 
        ...prev, 
        selected_game: data.game_name,
        selected_game_info: data.game_info,
        game_rules: data.current_rules,
        ...(data.max_players !== undefined && { max_players: data.max_players }) // Update max_players if provided
      } : null)
    }

    const handleGameSelectionCleared = (data: { max_players: number; message: string }) => {
      //console('Game selection cleared:', data)
      setCurrentLobby(prev => prev ? { 
        ...prev, 
        selected_game: undefined,
        selected_game_info: undefined,
        game_rules: {},
        max_players: data.max_players // Update max_players based on the event data
      } : null)
    }

    const handleGameRulesUpdated = (data: { rules: Record<string, any> }) => {
      //console('Game rules updated:', data)
      setCurrentLobby(prev => prev ? { 
        ...prev, 
        game_rules: data.rules 
      } : null)
    }

    const handleGameState = (data: { game_state: any }) => {
      setGameState(data.game_state)
    }

    const handleGameStarted = (data: { game_state: any }) => {
      setGameState(data.game_state)
      if (currentLobby?.lobby_code) {
        emitToggleReady(currentLobby.lobby_code)
      }
    }

    const handleMoveMade = (data: { game_state: any }) => {
      setGameState(data.game_state)
    }

    const handleGameEnded = (data: { game_state: any }) => {
      setGameState(data.game_state)
    }

    const handleInviteSent = () => {
      showPopup({ type: 'confirmation', message: `Invitation succesfully sent.` })
    }

    onLobbyCreated(handleLobbyCreated)
    onLobbyJoined(handleLobbyJoined)
    onLobbyLeft(handleLobbyLeft)
    onLobbyState(handleLobbyState)
    onMemberJoined(handleMemberJoined)
    onMemberLeft(handleMemberLeft)
    onHostTransferred(handleHostTransferred)
    onSettingsUpdated(handleSettingsUpdated)
    onMemberKicked(handleMemberKicked)
    onMemberReadyChanged(handleMemberReadyChanged)
    onPublicLobbies(handlePublicLobbies)
    onLobbyMessage(handleLobbyMessage)
    onLobbyMessagesHistory(handleLobbyMessagesHistory)
    onLobbyUserTyping(handleLobbyUserTyping)
    onKickedFromLobby(handleKickedFromLobby)
    onLobbyError(handleLobbyError)
    onAvailableGames(handleAvailableGames)
    onGameSelected(handleGameSelected)
    onGameSelectionCleared(handleGameSelectionCleared)
    onGameRulesUpdated(handleGameRulesUpdated)
    onGameState(handleGameState)
    onGameStarted(handleGameStarted)
    onMoveMade(handleMoveMade)
    onGameEnded(handleGameEnded)
    onLobbyInviteSent(handleInviteSent)

    return () => {
      offLobbyCreated(handleLobbyCreated)
      offLobbyJoined(handleLobbyJoined)
      offLobbyLeft(handleLobbyLeft)
      offLobbyState(handleLobbyState)
      offMemberJoined(handleMemberJoined)
      offMemberLeft(handleMemberLeft)
      offHostTransferred(handleHostTransferred)
      offSettingsUpdated(handleSettingsUpdated)
      offMemberKicked(handleMemberKicked)
      offMemberReadyChanged(handleMemberReadyChanged)
      offPublicLobbies(handlePublicLobbies)
      offLobbyMessage(handleLobbyMessage)
      offLobbyMessagesHistory(handleLobbyMessagesHistory)
      offLobbyUserTyping(handleLobbyUserTyping)
      offKickedFromLobby(handleKickedFromLobby)
      offLobbyError(handleLobbyError)
      offAvailableGames(handleAvailableGames)
      offGameSelected(handleGameSelected)
      offGameSelectionCleared(handleGameSelectionCleared)
      offGameRulesUpdated(handleGameRulesUpdated)
      offGameState(handleGameState)
      offGameStarted(handleGameStarted)
      offMoveMade(handleMoveMade)
      offGameEnded(handleGameEnded)
      offLobbyInviteSent(handleInviteSent)
    }
  }, [currentLobby?.lobby_code,showPopup])

  const createLobbyHandler = useCallback((maxPlayers: number = 6, isPublic: boolean = false, name?: string, gameName?: string) => {
    setIsLoading(true)
    setError(null)
    emitCreateLobby(maxPlayers, isPublic, name, gameName)
  }, [])

  const joinLobbyHandler = useCallback((lobbyCode: string) => {
    setIsLoading(true)
    setError(null)
    emitJoinLobby(lobbyCode)
  }, [])

  const leaveLobbyHandler = useCallback(() => {
    if (!currentLobby) return
    setIsLoading(true)
    emitLeaveLobby(currentLobby.lobby_code)
  }, [currentLobby])

  const updateSettingsHandler = useCallback((maxPlayers: number, isPublic: boolean, lobbyName?: string) => {
    if (!currentLobby) return
    
    const payload: Record<string, any> = {
      max_players: maxPlayers,
      is_public: isPublic,
    }
    
    if (lobbyName) {
      payload.name = lobbyName
    }
    
    emitUpdateSettings(currentLobby.lobby_code, maxPlayers, isPublic, lobbyName)
  }, [currentLobby])

  const transferHostHandler = useCallback((newHostId: number | string) => {
    setError(null)
    emitTransferHost(newHostId)
  }, [])

  const kickMemberHandler = useCallback((userId: number | string) => {
    setError(null)
    emitKickMember(userId)
  }, [])

  const toggleReadyHandler = useCallback(() => {
    if (!currentLobby) return
    setError(null)
    emitToggleReady(currentLobby.lobby_code)
  }, [currentLobby])

  const sendMessageHandler = useCallback((content: string) => {
    if (!currentLobby) return
    setError(null)
    emitSendLobbyMessage(currentLobby.lobby_code, content)
  }, [currentLobby])

  const getMessagesHandler = useCallback((limit: number = 50) => {
    if (!currentLobby) return
    emitGetLobbyMessages(currentLobby.lobby_code, limit)
  }, [currentLobby])

  const getPublicLobbiesHandler = useCallback(() => {
    setIsLoading(true)
    setError(null)
    emitGetPublicLobbies()
  }, [])

  const getPublicLobbiesByGameHandler = useCallback((gameName: string) => {
    setIsLoading(true)
    setError(null)
    emitGetPublicLobbiesByGame(gameName)
  }, [])

  const getLobbyStateHandler = useCallback(() => {
    setIsLoading(true)
    setError(null)
    emitGetLobby()
  }, [])

  const clearErrorHandler = useCallback(() => {
    setError(null)
  }, [])

  const startGameHandler = useCallback((gameName: string) => {
    if (!currentLobby) return
    setIsLoading(true)
    setError(null)
    emitCreateGame(gameName)
  }, [currentLobby])

  const getAvailableGamesHandler = useCallback(() => {
    setError(null)
    emitGetAvailableGames()
  }, [])

  const selectGameHandler = useCallback((gameName: string) => {
    if (!currentLobby) return
    setError(null)
    emitSelectGame(currentLobby.lobby_code, gameName)
  }, [currentLobby])

  const clearGameSelectionHandler = useCallback(() => {
    if (!currentLobby) return
    setError(null)
    emitClearGameSelection(currentLobby.lobby_code)
  }, [currentLobby])

  const setGameStateHandler = useCallback((state: any) => {
    setGameState(state);
  }, []);

  const sendIviteHandler = useCallback((friendId: string, lobbyCode: string) => {
    emitInviteFriend(lobbyCode, friendId)
  }, [])

  const value: LobbyContextValue = useMemo(
    () => ({
      isLoading,
      currentLobby,
      members,
      messages,
      typingUsers,
      publicLobbies,
      error,
      availableGames,
      gameState,
      createLobby: createLobbyHandler,
      sendInvite: sendIviteHandler,
      joinLobby: joinLobbyHandler,
      leaveLobby: leaveLobbyHandler,
      updateSettings: updateSettingsHandler,
      transferHost: transferHostHandler,
      kickMember: kickMemberHandler,
      toggleReady: toggleReadyHandler,
      sendMessage: sendMessageHandler,
      getMessages: getMessagesHandler,
      getPublicLobbies: getPublicLobbiesHandler,
      getPublicLobbiesByGame: getPublicLobbiesByGameHandler,
      getLobbyState: getLobbyStateHandler,
      clearError: clearErrorHandler,
      startGame: startGameHandler,
      getAvailableGames: getAvailableGamesHandler,
      selectGame: selectGameHandler,
      clearGameSelection: clearGameSelectionHandler,
      setGameState: setGameStateHandler,
      isLobbySocketConnected: isLobbySocketConnected(),
      isGameSocketConnected: isGameSocketConnected(),
    }),
    [
      isLoading,
      currentLobby,
      members,
      messages,
      typingUsers,
      publicLobbies,
      error,
      availableGames,
      gameState,
      createLobbyHandler,
      sendIviteHandler,
      joinLobbyHandler,
      leaveLobbyHandler,
      updateSettingsHandler,
      transferHostHandler,
      kickMemberHandler,
      toggleReadyHandler,
      sendMessageHandler,
      getMessagesHandler,
      getPublicLobbiesHandler,
      getPublicLobbiesByGameHandler,
      getLobbyStateHandler,
      clearErrorHandler,
      startGameHandler,
      getAvailableGamesHandler,
      selectGameHandler,
      clearGameSelectionHandler,
      setGameStateHandler,
      isLobbySocketConnected(),
      isGameSocketConnected(),
    ],
  )

  return <LobbyContext.Provider value={value}>{children}</LobbyContext.Provider>
}

export const useLobby = () => {
  const ctx = useContext(LobbyContext)
  if (!ctx) {
    throw new Error('useLobby must be used within LobbyProvider')
  }
  return ctx
}
