import { io, type Socket } from 'socket.io-client'
import { connectGameSocket, disconnectGameSocket } from './game'


const API_BASE_URL = (import.meta.env?.VITE_SOCKET_IO_URL ?? '') as string
const TRIMMED_BASE = API_BASE_URL.replace(/\/$/, '')
const SOCKET_URL = TRIMMED_BASE ? `${TRIMMED_BASE}/lobby` : '/lobby'
const SOCKET_PATH = '/socket.io'

export type LobbyMember = {
  user_id: number | string
  nickname: string
  pfp_path?: string
  is_ready: boolean
}

export type LobbyState = {
  lobby_code: string
  name: string
  host_id: number | string
  max_players: number
  current_players: number
  is_public: boolean
  members: LobbyMember[]
  created_at: string
  selected_game?: string
  game_rules?: Record<string, any>
}

export type LobbyMessage = {
  user_id: number | string
  nickname: string
  pfp_path?: string
  content: string
  timestamp: string
}

export type LobbyError = {
  message: string
  error_code: string
  details?: any
}

let lobbySocket: Socket | null = null

export const connectLobbySocket = (): Socket => {
  if (lobbySocket) {
    if (!lobbySocket.connected) lobbySocket.connect()
    return lobbySocket
  }

  lobbySocket = io(SOCKET_URL, {
    path: SOCKET_PATH,
    transports: ['websocket'],
    withCredentials: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    forceNew: false,
  })

  lobbySocket.on('connect_error', (err: any) => {
    console.error('Lobby socket connect_error:', err)
  })

  lobbySocket.on('connect', () => {
    connectGameSocket()
  })

  return lobbySocket
}

export const getLobbySocket = () => lobbySocket

export const disconnectLobbySocket = () => {
  if (lobbySocket) {
    lobbySocket.disconnect()
    lobbySocket = null
  }

  disconnectGameSocket()
  console.error("ODŁąCZAM OD WEBSOCKETA GRE")
}

// Emitters
export const emitCreateLobby = (maxPlayers: number = 6, isPublic: boolean = false, name?: string, gameName?: string) => {
  const payload: any = { max_players: maxPlayers, is_public: isPublic }
  if (name) payload.name = name
  if (gameName) payload.game_name = gameName
  lobbySocket?.emit('create_lobby', payload)
}

export const emitJoinLobby = (lobbyCode: string) => {
  lobbySocket?.emit('join_lobby', { lobby_code: lobbyCode })
}

export const emitLeaveLobby = (lobbyCode: string) => {
  lobbySocket?.emit('leave_lobby', { lobby_code: lobbyCode })
}

export const emitUpdateSettings = (maxPlayers: number, isPublic: boolean) => {
  lobbySocket?.emit('update_settings', { max_players: maxPlayers, is_public: isPublic })
}

export const emitTransferHost = (newHostId: number | string) => {
  lobbySocket?.emit('transfer_host', { new_host_id: newHostId })
}

export const emitGetLobby = () => {
  lobbySocket?.emit('get_lobby', {})
}

export const emitGetPublicLobbies = () => {
  lobbySocket?.emit('get_public_lobbies', {})
}

export const emitKickMember = (userId: number | string) => {
  lobbySocket?.emit('kick_member', { user_id: userId })
}

export const emitToggleReady = (lobbyCode: string) => {
  lobbySocket?.emit('toggle_ready', { lobby_code: lobbyCode })
}

export const emitSendLobbyMessage = (lobbyCode: string, content: string) => {
  lobbySocket?.emit('send_lobby_message', { lobby_code: lobbyCode, content })
}

export const emitLobbyTyping = (lobbyCode: string) => {
  lobbySocket?.emit('lobby_typing', { lobby_code: lobbyCode })
}

export const emitGetLobbyMessages = (lobbyCode: string, limit: number = 50) => {
  lobbySocket?.emit('get_lobby_messages', { lobby_code: lobbyCode, limit })
}

export const emitGetAvailableGames = () => {
  lobbySocket?.emit('get_available_games', {})
}

export const emitSelectGame = (lobbyCode: string, gameName: string) => {
  lobbySocket?.emit('select_game', { lobby_code: lobbyCode, game_name: gameName })
}

export const emitClearGameSelection = (lobbyCode: string) => {
  lobbySocket?.emit('clear_game_selection', { lobby_code: lobbyCode })
}

// Listeners
export const onLobbyCreated = (cb: (data: { lobby_code: string }) => void) => 
  lobbySocket?.on('lobby_created', cb)
export const offLobbyCreated = (cb?: (data: { lobby_code: string }) => void) => {
  if (!lobbySocket) return
  cb ? lobbySocket.off('lobby_created', cb) : lobbySocket.off('lobby_created')
}

export const onLobbyJoined = (cb: (data: { lobby: LobbyState }) => void) => 
  lobbySocket?.on('lobby_joined', cb)
export const offLobbyJoined = (cb?: (data: { lobby: LobbyState }) => void) => {
  if (!lobbySocket) return
  cb ? lobbySocket.off('lobby_joined', cb) : lobbySocket.off('lobby_joined')
}

export const onLobbyLeft = (cb: (data: any) => void) => 
  lobbySocket?.on('lobby_left', cb)
export const offLobbyLeft = (cb?: (data: any) => void) => {
  if (!lobbySocket) return
  cb ? lobbySocket.off('lobby_left', cb) : lobbySocket.off('lobby_left')
}

export const onLobbyState = (cb: (data: LobbyState) => void) => 
  lobbySocket?.on('lobby_state', cb)
export const offLobbyState = (cb?: (data: LobbyState) => void) => {
  if (!lobbySocket) return
  cb ? lobbySocket.off('lobby_state', cb) : lobbySocket.off('lobby_state')
}

export const onMemberJoined = (cb: (data: { member: LobbyMember; current_players: number }) => void) => 
  lobbySocket?.on('member_joined', cb)
export const offMemberJoined = (cb?: (data: { member: LobbyMember; current_players: number }) => void) => {
  if (!lobbySocket) return
  cb ? lobbySocket.off('member_joined', cb) : lobbySocket.off('member_joined')
}

export const onMemberLeft = (cb: (data: { user_id: number | string; nickname: string; current_players: number }) => void) => 
  lobbySocket?.on('member_left', cb)
export const offMemberLeft = (cb?: (data: { user_id: number | string; nickname: string; current_players: number }) => void) => {
  if (!lobbySocket) return
  cb ? lobbySocket.off('member_left', cb) : lobbySocket.off('member_left')
}

export const onHostTransferred = (cb: (data: { old_host_id: number | string; new_host_id: number | string; new_host_nickname: string }) => void) => 
  lobbySocket?.on('host_transferred', cb)
export const offHostTransferred = (cb?: (data: { old_host_id: number | string; new_host_id: number | string; new_host_nickname: string }) => void) => {
  if (!lobbySocket) return
  cb ? lobbySocket.off('host_transferred', cb) : lobbySocket.off('host_transferred')
}

export const onSettingsUpdated = (cb: (data: { max_players: number; is_public: boolean }) => void) => 
  lobbySocket?.on('settings_updated', cb)
export const offSettingsUpdated = (cb?: (data: { max_players: number; is_public: boolean }) => void) => {
  if (!lobbySocket) return
  cb ? lobbySocket.off('settings_updated', cb) : lobbySocket.off('settings_updated')
}

export const onMemberKicked = (cb: (data: { user_id: number | string; nickname: string; kicked_by_id: number | string }) => void) => 
  lobbySocket?.on('member_kicked', cb)
export const offMemberKicked = (cb?: (data: { user_id: number | string; nickname: string; kicked_by_id: number | string }) => void) => {
  if (!lobbySocket) return
  cb ? lobbySocket.off('member_kicked', cb) : lobbySocket.off('member_kicked')
}

export const onMemberReadyChanged = (cb: (data: { user_id: number | string; nickname: string; is_ready: boolean }) => void) => 
  lobbySocket?.on('member_ready_changed', cb)
export const offMemberReadyChanged = (cb?: (data: { user_id: number | string; nickname: string; is_ready: boolean }) => void) => {
  if (!lobbySocket) return
  cb ? lobbySocket.off('member_ready_changed', cb) : lobbySocket.off('member_ready_changed')
}

export const onPublicLobbies = (cb: (data: { lobbies: LobbyState[]; total: number }) => void) => 
  lobbySocket?.on('public_lobbies', cb)
export const offPublicLobbies = (cb?: (data: { lobbies: LobbyState[]; total: number }) => void) => {
  if (!lobbySocket) return
  cb ? lobbySocket.off('public_lobbies', cb) : lobbySocket.off('public_lobbies')
}

export const onLobbyMessage = (cb: (data: LobbyMessage) => void) => 
  lobbySocket?.on('lobby_message', cb)
export const offLobbyMessage = (cb?: (data: LobbyMessage) => void) => {
  if (!lobbySocket) return
  cb ? lobbySocket.off('lobby_message', cb) : lobbySocket.off('lobby_message')
}

export const onLobbyMessagesHistory = (cb: (data: { messages: LobbyMessage[]; lobby_code: string; total: number }) => void) => 
  lobbySocket?.on('lobby_messages_history', cb)
export const offLobbyMessagesHistory = (cb?: (data: { messages: LobbyMessage[]; lobby_code: string; total: number }) => void) => {
  if (!lobbySocket) return
  cb ? lobbySocket.off('lobby_messages_history', cb) : lobbySocket.off('lobby_messages_history')
}

export const onLobbyUserTyping = (cb: (data: { user_id: number | string; nickname: string }) => void) => 
  lobbySocket?.on('lobby_user_typing', cb)
export const offLobbyUserTyping = (cb?: (data: { user_id: number | string; nickname: string }) => void) => {
  if (!lobbySocket) return
  cb ? lobbySocket.off('lobby_user_typing', cb) : lobbySocket.off('lobby_user_typing')
}

export const onKickedFromLobby = (cb: (data: { lobby_code: string; message: string }) => void) => 
  lobbySocket?.on('kicked_from_lobby', cb)
export const offKickedFromLobby = (cb?: (data: { lobby_code: string; message: string }) => void) => {
  if (!lobbySocket) return
  cb ? lobbySocket.off('kicked_from_lobby', cb) : lobbySocket.off('kicked_from_lobby')
}

export const onLobbyError = (cb: (data: LobbyError) => void) => 
  lobbySocket?.on('lobby_error', cb)
export const offLobbyError = (cb?: (data: LobbyError) => void) => {
  if (!lobbySocket) return
  cb ? lobbySocket.off('lobby_error', cb) : lobbySocket.off('lobby_error')
}

export const onLobbyClosed = (cb: (data: any) => void) => 
  lobbySocket?.on('lobby_closed', cb)
export const offLobbyClosed = (cb?: (data: any) => void) => {
  if (!lobbySocket) return
  cb ? lobbySocket.off('lobby_closed', cb) : lobbySocket.off('lobby_closed')
}

export const onAvailableGames = (cb: (data: { games: any[]; total: number }) => void) => 
  lobbySocket?.on('available_games', cb)
export const offAvailableGames = (cb?: (data: { games: any[]; total: number }) => void) => {
  if (!lobbySocket) return
  cb ? lobbySocket.off('available_games', cb) : lobbySocket.off('available_games')
}

export const onGameSelected = (cb: (data: { game_name: string; game_info: any; current_rules: any }) => void) => 
  lobbySocket?.on('game_selected', cb)
export const offGameSelected = (cb?: (data: { game_name: string; game_info: any; current_rules: any }) => void) => {
  if (!lobbySocket) return
  cb ? lobbySocket.off('game_selected', cb) : lobbySocket.off('game_selected')
}

export const onGameSelectionCleared = (cb: (data: any) => void) => 
  lobbySocket?.on('game_selection_cleared', cb)
export const offGameSelectionCleared = (cb?: (data: any) => void) => {
  if (!lobbySocket) return
  cb ? lobbySocket.off('game_selection_cleared', cb) : lobbySocket.off('game_selection_cleared')
}
