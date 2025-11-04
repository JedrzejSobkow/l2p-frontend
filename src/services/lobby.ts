import { request } from '../lib/http'
import { io, type Socket } from 'socket.io-client'

const API_BASE_URL = (import.meta.env?.VITE_SOCKET_IO_URL ?? '') as string
const TRIMMED_BASE = API_BASE_URL.replace(/\/$/, '')
const SOCKET_URL = TRIMMED_BASE ? `${TRIMMED_BASE}/lobby` : '/lobby'
const SOCKET_PATH = '/socket.io'

export type CreateLobbyPayload = {
  max_players?: number
}

export type CreateLobbyResponse = {
  lobby_code: string
  message: string
}

export type LobbyMember = {
  user_id: number
  nickname: string
  is_host: boolean
  is_ready: boolean
  joined_at: string
}

export type GameInfo = {
  name: string
  img_path: string
  rules: string
}

export type CurrentLobbyResponse = {
  lobby_code: string
  host_id: number
  max_players: number
  current_players: number
  members: LobbyMember[]
  game: GameInfo
  created_at: string
}

export type MemberReadyChangedEvent = {
  user_id: number
  nickname: string
  is_ready: boolean
}

let lobbySocket: Socket | null = null

export const connectLobbySocket = () => {
  // Force disconnect and cleanup if socket exists
  if (lobbySocket) {
    if (lobbySocket.connected) {
      return lobbySocket
    }
    // Socket exists but not connected, try to reconnect
    lobbySocket.connect()
    return lobbySocket
  }

  // Create new socket
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

  // Handle authentication errors
  lobbySocket.on('connect_error', (error: any) => {
    console.error('Socket connection error:', error)
  })

  return lobbySocket
}

export const getLobbySocket = () => lobbySocket

export const disconnectLobbySocket = () => {
  if (lobbySocket) {
    lobbySocket.disconnect()
    lobbySocket = null
  }
}

export const reconnectLobbySocket = () => {
  if (lobbySocket) {
    console.log('Reconnecting lobby socket...')
    lobbySocket.disconnect()
    setTimeout(() => {
      if (lobbySocket) {
        lobbySocket.connect()
      }
    }, 500)
  }
}

export const emitToggleReady = (lobbyCode: string) => {
  if (lobbySocket) {
    console.log('IM IN HERE')
    lobbySocket.emit('toggle_ready', { lobby_code: lobbyCode })
  }
}

export const emitTransferHost = (lobbyCode: string, newHostId: number) => {
  if (lobbySocket) {
    console.log('Transferring host to user:', newHostId)
    lobbySocket.emit('transfer_host', { lobby_code: lobbyCode, new_host_id: newHostId })
  }
}

export const emitKickMember = (lobbyCode: string, userId: number) => {
  if (lobbySocket) {
    console.log('Kicking member:', userId)
    lobbySocket.emit('kick_member', { lobby_code: lobbyCode, user_id: userId })
  }
}

export const emitUpdateSettings = (lobbyCode: string, maxPlayers: number) => {
  if (lobbySocket) {
    console.log('Updating lobby settings:', maxPlayers)
    lobbySocket.emit('update_settings', { lobby_code: lobbyCode, max_players: maxPlayers })
  }
}

export const emitLeaveLobby = (lobbyCode: string) => {
  if (lobbySocket) {
    console.log('Leaving lobby:', lobbyCode)
    lobbySocket.emit('leave_lobby', { lobby_code: lobbyCode })
  }
}

export const onMemberReadyChanged = (callback: (data: MemberReadyChangedEvent) => void) => {
  if (lobbySocket) {
    lobbySocket.on('member_ready_changed', callback)
  }
}

export const offMemberReadyChanged = (callback?: (data: MemberReadyChangedEvent) => void) => {
  if (lobbySocket) {
    if (callback) {
      lobbySocket.off('member_ready_changed', callback)
    } else {
      lobbySocket.off('member_ready_changed')
    }
  }
}

export const onHostTransferred = (callback: (data: any) => void) => {
  if (lobbySocket) {
    lobbySocket.on('host_transferred', callback)
  }
}

export const offHostTransferred = (callback?: (data: any) => void) => {
  if (lobbySocket) {
    if (callback) {
      lobbySocket.off('host_transferred', callback)
    } else {
      lobbySocket.off('host_transferred')
    }
  }
}

export const onMemberKicked = (callback: (data: any) => void) => {
  if (lobbySocket) {
    lobbySocket.on('member_kicked', callback)
  }
}

export const offMemberKicked = (callback?: (data: any) => void) => {
  if (lobbySocket) {
    if (callback) {
      lobbySocket.off('member_kicked', callback)
    } else {
      lobbySocket.off('member_kicked')
    }
  }
}

export const onKickedFromLobby = (callback: (data: any) => void) => {
  if (lobbySocket) {
    lobbySocket.on('kicked_from_lobby', callback)
  }
}

export const offKickedFromLobby = (callback?: (data: any) => void) => {
  if (lobbySocket) {
    if (callback) {
      lobbySocket.off('kicked_from_lobby', callback)
    } else {
      lobbySocket.off('kicked_from_lobby')
    }
  }
}

export const onSettingsUpdated = (callback: (data: any) => void) => {
  if (lobbySocket) {
    lobbySocket.on('settings_updated', callback)
  }
}

export const offSettingsUpdated = (callback?: (data: any) => void) => {
  if (lobbySocket) {
    if (callback) {
      lobbySocket.off('settings_updated', callback)
    } else {
      lobbySocket.off('settings_updated')
    }
  }
}

export const onMemberLeft = (callback: (data: any) => void) => {
  if (lobbySocket) {
    lobbySocket.on('member_left', callback)
  }
}

export const offMemberLeft = (callback?: (data: any) => void) => {
  if (lobbySocket) {
    if (callback) {
      lobbySocket.off('member_left', callback)
    } else {
      lobbySocket.off('member_left')
    }
  }
}

export const onLobbyLeft = (callback: (data: any) => void) => {
  if (lobbySocket) {
    lobbySocket.on('lobby_left', callback)
  }
}

export const offLobbyLeft = (callback?: (data: any) => void) => {
  if (lobbySocket) {
    if (callback) {
      lobbySocket.off('lobby_left', callback)
    } else {
      lobbySocket.off('lobby_left')
    }
  }
}

// REST API calls (kept for backward compatibility)
export async function createLobby(payload: CreateLobbyPayload): Promise<CreateLobbyResponse> {
  return await request<CreateLobbyResponse>('/lobby', { 
    method: 'POST', 
    body: payload,
    auth: true 
  })
}

export async function getCurrentLobby(): Promise<CurrentLobbyResponse> {
  return await request<CurrentLobbyResponse>('/lobby/me/current', {
    method: 'GET',
    auth: true
  })
}

export async function leaveLobby(lobbyCode: string): Promise<void> {
  return await request<void>(`/lobby/${lobbyCode}/leave`, {
    method: 'POST',
    auth: true
  })
}

export async function joinLobby(lobbyCode: string): Promise<CurrentLobbyResponse> {
  return await request<CurrentLobbyResponse>(`/lobby/${lobbyCode}/join`, {
    method: 'POST',
    auth: true
  })
}

export async function transferHost(lobbyCode: string, newHostId: number): Promise<CurrentLobbyResponse> {
  return await request<CurrentLobbyResponse>(`/lobby/${lobbyCode}/transfer-host`, {
    method: 'POST',
    body: { new_host_id: newHostId },
    auth: true
  })
}

export async function toggleReadyStatus(lobbyCode: string): Promise<string> {
  return await request<string>(`/lobby/${lobbyCode}/ready`, {
    method: 'POST',
    auth: true
  })
}
