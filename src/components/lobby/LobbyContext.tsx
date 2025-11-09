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
  type LobbyState,
  type LobbyMember,
  type LobbyMessage,
  type LobbyError,
} from '../../services/lobby'


import {
    emitCreateGame,
    offGameStarted,
    onGameStarted
} from '../../services/game'

type LobbyContextValue = {
  isLoading: boolean
  currentLobby: LobbyState | null
  members: LobbyMember[]
  messages: LobbyMessage[]
  typingUsers: string[]
  publicLobbies: LobbyState[]
  error: LobbyError | null
  createLobby: (maxPlayers?: number, isPublic?: boolean, name?: string) => void
  joinLobby: (lobbyCode: string) => void
  leaveLobby: () => void
  updateSettings: (maxPlayers: number, isPublic: boolean) => void
  transferHost: (newHostId: number | string) => void
  kickMember: (userId: number | string) => void
  toggleReady: () => void
  sendMessage: (content: string) => void
  getMessages: (limit?: number) => void
  getPublicLobbies: () => void
  getLobbyState: () => void
  clearError: () => void
  startGame: (gameName: string) => void
}

const LobbyContext = createContext<LobbyContextValue | undefined>(undefined)

export const LobbyProvider = ({ children }: { children: ReactNode }) => {
  const [currentLobby, setCurrentLobby] = useState<LobbyState | null>(null)
  const [members, setMembers] = useState<LobbyMember[]>([])
  const [messages, setMessages] = useState<LobbyMessage[]>([])
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [publicLobbies, setPublicLobbies] = useState<LobbyState[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<LobbyError | null>(null)

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
      console.log('Lobby created:', data)
      setIsLoading(false)
    }

    const handleLobbyJoined = (data: { lobby: LobbyState }) => {
      console.log('Lobby joined:', data)
      setCurrentLobby(data.lobby)
      setMembers(data.lobby.members)
      setMessages([])
      setIsLoading(false)
    }

    const handleLobbyLeft = () => {
      console.log('Lobby left')
      setCurrentLobby(null)
      setMembers([])
      setMessages([])
      setTypingUsers([])
      setIsLoading(false)
    }

    const handleLobbyState = (data: LobbyState) => {
      console.log('Lobby state:', data)
      setCurrentLobby(data)
      setMembers(data.members)
      setIsLoading(false)
    }

    const handleMemberJoined = (data: { member: LobbyMember; current_players: number }) => {
      console.log('Member joined:', data)
      setMembers(prev => [...prev, data.member])
      setCurrentLobby(prev => prev ? { ...prev, current_players: data.current_players } : null)
    }

    const handleMemberLeft = (data: { user_id: number | string; nickname: string; current_players: number }) => {
      console.log('Member left:', data)
      setMembers(prev => prev.filter(m => m.user_id !== data.user_id))
      setCurrentLobby(prev => prev ? { ...prev, current_players: data.current_players } : null)
    }

    const handleHostTransferred = (data: { old_host_id: number | string; new_host_id: number | string; new_host_nickname: string }) => {
      console.log('Host transferred:', data)
      setCurrentLobby(prev => prev ? { ...prev, host_id: data.new_host_id } : null)
    }

    const handleSettingsUpdated = (data: { max_players: number; is_public: boolean }) => {
      console.log('Settings updated:', data)
      setCurrentLobby(prev => prev ? { ...prev, max_players: data.max_players, is_public: data.is_public } : null)
    }

    const handleMemberKicked = (data: { user_id: number | string; nickname: string; kicked_by_id: number | string }) => {
      console.log('Member kicked:', data)
      setMembers(prev => prev.filter(m => m.user_id !== data.user_id))
    }

    const handleMemberReadyChanged = (data: { user_id: number | string; nickname: string; is_ready: boolean }) => {
      console.log('Member ready changed:', data)
      setMembers(prev => prev.map(m => m.user_id === data.user_id ? { ...m, is_ready: data.is_ready } : m))
    }

    const handlePublicLobbies = (data: { lobbies: LobbyState[]; total: number }) => {
      console.log('Public lobbies:', data)
      setPublicLobbies(data.lobbies)
      setIsLoading(false)
    }

    const handleLobbyMessage = (data: LobbyMessage) => {
      console.log('Lobby message:', data)
      setMessages(prev => [...prev, data])
    }

    const handleLobbyMessagesHistory = (data: { messages: LobbyMessage[]; lobby_code: string; total: number }) => {
      console.log('Lobby messages history:', data)
      setMessages(data.messages)
    }

    const handleLobbyUserTyping = (data: { user_id: number | string; nickname: string }) => {
      console.log('User typing:', data)
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
      console.log('Kicked from lobby:', data)
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

    const handleGameStarted = (data: { lobby_code: string; game_name: string; game_state: any }) => {
      console.log('Game started:', data)
      setIsLoading(false)
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
    onGameStarted(handleGameStarted)

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
      offGameStarted(handleGameStarted)
    }
  }, [])

  const createLobbyHandler = useCallback((maxPlayers: number = 6, isPublic: boolean = false, name?: string) => {
    setIsLoading(true)
    setError(null)
    emitCreateLobby(maxPlayers, isPublic, name)
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

  const updateSettingsHandler = useCallback((maxPlayers: number, isPublic: boolean) => {
    setError(null)
    emitUpdateSettings(maxPlayers, isPublic)
  }, [])

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

  const value: LobbyContextValue = useMemo(
    () => ({
      isLoading,
      currentLobby,
      members,
      messages,
      typingUsers,
      publicLobbies,
      error,
      createLobby: createLobbyHandler,
      joinLobby: joinLobbyHandler,
      leaveLobby: leaveLobbyHandler,
      updateSettings: updateSettingsHandler,
      transferHost: transferHostHandler,
      kickMember: kickMemberHandler,
      toggleReady: toggleReadyHandler,
      sendMessage: sendMessageHandler,
      getMessages: getMessagesHandler,
      getPublicLobbies: getPublicLobbiesHandler,
      getLobbyState: getLobbyStateHandler,
      clearError: clearErrorHandler,
      startGame: startGameHandler,
    }),
    [
      isLoading,
      currentLobby,
      members,
      messages,
      typingUsers,
      publicLobbies,
      error,
      createLobbyHandler,
      joinLobbyHandler,
      leaveLobbyHandler,
      updateSettingsHandler,
      transferHostHandler,
      kickMemberHandler,
      toggleReadyHandler,
      sendMessageHandler,
      getMessagesHandler,
      getPublicLobbiesHandler,
      getLobbyStateHandler,
      clearErrorHandler,
      startGameHandler,
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
