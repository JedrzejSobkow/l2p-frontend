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
  if (lobbySocket) {
    if (!lobbySocket.connected) {
      lobbySocket.connect()
    }
    return lobbySocket
  }

  lobbySocket = io(SOCKET_URL, {
    path: SOCKET_PATH,
    transports: ['websocket'],
    withCredentials: true,
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

export const emitToggleReady = (lobbyCode: string) => {
  if (lobbySocket) {
    console.log('IM IN HERE')
    lobbySocket.emit('toggle_ready', { lobby_code: lobbyCode })
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
