import { io, type Socket } from 'socket.io-client'

const API_BASE_URL = (import.meta.env?.VITE_SOCKET_IO_URL ?? '') as string
const TRIMMED_BASE = API_BASE_URL.replace(/\/$/, '')
const SOCKET_URL = TRIMMED_BASE ? `${TRIMMED_BASE}/game` : '/game'
const SOCKET_PATH = '/socket.io'

export type EngineConfig = {
  game_name: string
  lobby_code: string
  player_ids: number[]
  rules: Record<string, any>
  current_turn_index: number
}

export type GameStatePayload = {
  game_state: any
  engine_config?: EngineConfig
  lobby_code?: string
}

export type GameStartedEvent = {
  lobby_code: string
  game_name: string
  game_state: any
  game_info?: any
  current_turn_player_id?: number
}

export type MoveMadeEvent = {
  lobby_code: string
  player_id: number
  move_data: any
  game_state: any
  current_turn_player_id?: number
}

export type GameEndedEvent = {
  lobby_code: string
  result: string
  winner_id: number | null
  game_state: any
}

export type PlayerForfeitedEvent = {
  lobby_code: string
  player_id: number
  winner_id: number | null
  game_state: any
}

export type GameErrorEvent = {
  error: string
  details?: any
}

let gameSocket: Socket | null = null

export const connectGameSocket = (): Socket => {
  if (gameSocket) {
    if (!gameSocket.connected) gameSocket.connect()
    return gameSocket
  }
  gameSocket = io(SOCKET_URL, {
    path: SOCKET_PATH,
    transports: ['websocket'],
    withCredentials: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    forceNew: false,
  })
  gameSocket.on('connect_error', (err: any) => {
    console.error('Game socket connect_error:', err)
  })
  return gameSocket
}

export const getGameSocket = () => gameSocket

export const disconnectGameSocket = () => {
  if (gameSocket) {
    gameSocket.disconnect()
    gameSocket = null
  }
}

// Emitters
export const emitCreateGame = (game_name: string, rules?: Record<string, any>) => {
  gameSocket?.emit('create_game', { game_name, rules })
}

export const emitMakeMove = (move_data: any) => {
  gameSocket?.emit('make_move', { move_data })
}

export const emitForfeit = () => {
  gameSocket?.emit('forfeit', {})
}

export const emitGetGameState = () => {
  gameSocket?.emit('get_game_state', {})
}

// Listeners
export const onGameStarted = (cb: (ev: GameStartedEvent) => void) => gameSocket?.on('game_started', cb)
export const offGameStarted = (cb?: (ev: GameStartedEvent) => void) => {
  if (!gameSocket) return
  cb ? gameSocket.off('game_started', cb) : gameSocket.off('game_started')
}

export const onMoveMade = (cb: (ev: MoveMadeEvent) => void) => gameSocket?.on('move_made', cb)
export const offMoveMade = (cb?: (ev: MoveMadeEvent) => void) => {
  if (!gameSocket) return
  cb ? gameSocket.off('move_made', cb) : gameSocket.off('move_made')
}

export const onGameEnded = (cb: (ev: GameEndedEvent) => void) => gameSocket?.on('game_ended', cb)
export const offGameEnded = (cb?: (ev: GameEndedEvent) => void) => {
  if (!gameSocket) return
  cb ? gameSocket.off('game_ended', cb) : gameSocket.off('game_ended')
}

export const onGameState = (cb: (ev: GameStatePayload) => void) => gameSocket?.on('game_state', cb)
export const offGameState = (cb?: (ev: GameStatePayload) => void) => {
  if (!gameSocket) return
  cb ? gameSocket.off('game_state', cb) : gameSocket.off('game_state')
}

export const onPlayerForfeited = (cb: (ev: PlayerForfeitedEvent) => void) => gameSocket?.on('player_forfeited', cb)
export const offPlayerForfeited = (cb?: (ev: PlayerForfeitedEvent) => void) => {
  if (!gameSocket) return
  cb ? gameSocket.off('player_forfeited', cb) : gameSocket.off('player_forfeited')
}

export const onGameError = (cb: (ev: GameErrorEvent) => void) => gameSocket?.on('game_error', cb)
export const offGameError = (cb?: (ev: GameErrorEvent) => void) => {
  if (!gameSocket) return
  cb ? gameSocket.off('game_error', cb) : gameSocket.off('game_error')
}

