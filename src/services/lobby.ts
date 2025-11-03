import { request } from '../lib/http'

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
