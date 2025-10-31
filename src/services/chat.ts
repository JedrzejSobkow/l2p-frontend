import { request } from '../lib/http'
import { io, type Socket } from 'socket.io-client'

const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL ?? '') as string
const TRIMMED_BASE = API_BASE_URL.replace(/\/$/, '')
const SOCKET_URL = TRIMMED_BASE ? `${TRIMMED_BASE}/chat` : '/chat'
const SOCKET_PATH = '/socket.io'

export type ChatMessageDTO = {
  id: string | number
  sender_id: string | number
  sender_nickname: string
  content: string | null
  created_at: string
  is_mine: boolean
  image_url?: string | null
}

export type ConversationHistoryPayload = {
  messages: ChatMessageDTO[]
  total: number
  limit: number
  has_more: boolean
  next_cursor?: string | number | null
  friend_user_id: string | number
  friend_nickname: string
}

export type Conversation = {
  friendship_id: string | number
  friend_id: string | number
  friend_nickname: string
  friend_email?: string
  friend_pfp_path?: string
  last_message_time: string
  last_message_content: string | null
  last_message_is_mine: boolean
  unread_count: number
}

export type SendChatMessagePayload = {
  friend_user_id: number | string
  content?: string
  image_path?: string
}

export type TypingIndicatorPayload = {
  friend_user_id: number | string
}

export type UploadImagePayload = {
  friend_user_id: number | string
  filename: string
  content_type: string
}

export type UploadImageResponse = {
  upload_url: string
  object_name: string
  image_path: string
  expires_in_minutes: number
}

export type ConversationUpdatedEvent = {
  friendship_id: string | number
  friend_id: string | number
  friend_nickname: string
  friend_pfp_path?: string | null
  last_message_time: string
  last_message_content: string | null
  last_message_is_mine: boolean
}

export type UserTypingEvent = {
  user_id: string | number
  nickname: string
}

export type SocketErrorEvent = {
  message: string
  errors?: unknown
}

let socket: Socket | null = null

export const connectChatSocket = (auth?: Record<string, unknown>) => {
  if (socket) {
    if (!socket.connected) {
      socket.auth = auth ?? socket.auth
      socket.connect()
    }
    return socket
  }

  socket = io(SOCKET_URL, {
    path: SOCKET_PATH,
    transports: ['websocket'],
    withCredentials: true,
    auth,
  })
  return socket
}

export const getChatSocket = () => socket

export const disconnectChatSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export const sendMessage = (payload: SendChatMessagePayload) => {
  socket?.emit('send_message', payload)
}

export const sendTyping = (payload: TypingIndicatorPayload) => {
  socket?.emit('typing', payload)
}

export async function getMessages(
  friend_user_id: string | number,
  before_message_id?: string | number,
  limit: number = 50,
): Promise<ConversationHistoryPayload> {
  const params = new URLSearchParams()
  if (before_message_id) {
    params.set('before_message_id', String(before_message_id))
  }
  params.set('limit', String(limit))
  const query = params.toString()
  const path = query ? `/chat/history/${friend_user_id}?${query}` : `/chat/history/${friend_user_id}`
  return await request<ConversationHistoryPayload>(path, { method: 'GET'})
}

export async function getConversations(limit?: number): Promise<{ conversations: Conversation[] }> {
  const params = new URLSearchParams()
  if (limit) params.set('limit', String(limit))
  const query = params.toString()
  const path = query ? `/chat/conversations?${query}` : `/chat/conversations`
  return await request<{ conversations: Conversation[] }>(path, { method: 'GET'})
}

export async function uploadImage(payload: UploadImagePayload): Promise<UploadImageResponse> {
  return await request<UploadImageResponse>(`/chat/get-upload-url`, { method: 'POST', body: payload})
}
