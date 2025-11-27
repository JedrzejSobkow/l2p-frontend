import { request } from '../lib/http'
import { type Socket } from 'socket.io-client'
import { connectNamespaceSocket, disconnectNamespaceSocket, getNamespaceSocket } from './socket'

const CHAT_NAMESPACE = '/chat'

export type UserStatus = 'online' | 'offline' | 'in_lobby' | 'in_game'

export type FriendStatusUpdatePayload = { 
  user_id: string; 
  status: UserStatus, 
  game_name?: string, 
  lobby_code?: string,
  lobby_filled_slots?: number,
  lobby_max_slots?: number
}

export type FriendRequestReceivedPayload = {
  sender_id: string, 
  sender_nickname: string, 
  sender_pfp_path?: string
}

export type ChatMessageDTO = {
  id: string | number
  sender_id: string | number
  sender_nickname: string
  content?: string
  created_at: string
  is_mine: boolean
  image_url?: string
}

export type ConversationHistoryPayload = {
  messages: ChatMessageDTO[]
  total: number
  limit: number
  has_more: boolean
  next_cursor: string | null
  friend_user_id: string
  friend_nickname: string
}

export type Conversation = {
  friendship_id: string
  friend_id: string
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
  friend_user_id: string
}

export type UploadImagePayload = {
  friend_user_id: string
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
  friendship_id: string
  friend_id: string
  friend_nickname: string
  last_message_time: string
  last_message_content: string | null
  last_message_is_mine: boolean
}

export type UserTypingEvent = {
  user_id: string
  nickname: string
}

export type SocketErrorEvent = {
  message: string
  errors?: unknown
}

let socket: Socket | null = null
let listenersRegistered = false

export const connectChatSocket = (auth?: Record<string, unknown>) => {
  socket = getNamespaceSocket(CHAT_NAMESPACE)
  if (!listenersRegistered) {
    socket.on('connect', () => {
      console.log('Chat socket connected')
    })
    listenersRegistered = true
  }
  if (!socket.connected) {
    socket.connect()
  }

  return socket
}

export const getChatSocket = () => {
  socket = socket ?? getNamespaceSocket(CHAT_NAMESPACE)
  return socket
}

export const disconnectChatSocket = () => {
  if (socket) {
    disconnectNamespaceSocket(CHAT_NAMESPACE)
    socket = null
  }
}
export const onConnect = (callback: () => void) => {
  socket?.on('connect', callback)
}
export const offConnect = (callback: () => void) => {
  if (!socket) return
  socket?.off('connect', callback)
}
export const onDisconnect = (callback: () => void) => {
  socket?.on('disconnect', callback)
}
export const offDisconnect = (callback: () => void) => {
  if (!socket) return
  socket?.off('disconnect', callback)
}
export const onFriendRemoved = (callback: (payload: { friend_user_id: string }) => void) => {
  socket?.on('friend_removed', callback)
}
export const offFriendRemoved = (callback: (payload: { friend_user_id: string }) => void) => {
  if (!socket) return
  socket?.off('friend_removed', callback)
}
export const onFriendRequestReceived = (callback: (payload: FriendRequestReceivedPayload ) => void) => {
  socket?.on('friend_request_received', callback)
}
export const offFriendRequestReceived = (callback: (payload: FriendRequestReceivedPayload ) => void) => {
  if (!socket) return
  socket?.off('friend_request_received', callback)
}

export const onFriendStatusUpdated = (callback: (payload: FriendStatusUpdatePayload) => void) => {
  socket?.on('friend_status_update', callback)
}
export const offFriendStatusUpdated = (callback: (payload: FriendStatusUpdatePayload) => void) => {
  if (!socket) return
  socket?.off('friend_status_update', callback)
}

export const onInitialFriendStatuses = (callback: (payload: {statuses: FriendStatusUpdatePayload[]}) => void) => {
  socket?.on('initial_friend_statuses', callback)
}
export const offInitialFriendStatuses = (callback: (payload: {statuses: FriendStatusUpdatePayload[]}) => void) => {
  if (!socket) return
  socket?.off('initial_friend_statuses', callback)
}
export const onMessage = (callback: (payload: ChatMessageDTO) => void) => {
  socket?.on('message', callback)
}
export const offMessage = (callback: (payload: ChatMessageDTO) => void) => {
  if (!socket) return
  socket?.off('message', callback)
}
export const onUserTyping = (callback: (payload: UserTypingEvent) => void) => {
  socket?.on('user_typing', callback)
}
export const offUserTyping = (callback: (payload: UserTypingEvent) => void) => {
  if (!socket) return
  socket?.off('user_typing', callback)
}
export const onConversationUpdated = (callback: (payload: ConversationUpdatedEvent) => void) => {
  socket?.on('conversation_updated', callback)
}
export const offConversationUpdated = (callback: (payload: ConversationUpdatedEvent) => void) => {
  if (!socket) return
  socket?.off('conversation_updated', callback)
}

export const sendMessage = (payload: SendChatMessagePayload) => {
  socket?.emit('send_message', payload)
}

export const sendTyping = (payload: TypingIndicatorPayload) => {
  socket?.emit('typing', payload)
}

export async function getMessages(
  friend_user_id: string,
  before_message_id?: string,
  limit?: number,
): Promise<ConversationHistoryPayload> {
  const params = new URLSearchParams()
  if (before_message_id) {
    params.set('before_message_id', before_message_id)
  }
  if (limit){
    params.set('limit', String(limit))
  }
  const query = params.toString()
  const path = query ? `/chat/history/${friend_user_id}?${query}` : `/chat/history/${friend_user_id}`
  return await request<ConversationHistoryPayload>(path, { method: 'GET', auth: true })
}

export async function getInitialChats(limit?: number): Promise<{ conversations: Conversation[] }> {
  const params = new URLSearchParams()
  if (limit) params.set('limit', String(limit))
  const query = params.toString()
  const path = query ? `/chat/conversations?${query}` : `/chat/conversations`
  return await request<{ conversations: Conversation[] }>(path, { method: 'GET', auth: true })
}

export async function uploadImage(payload: UploadImagePayload): Promise<UploadImageResponse> {
  return await request<UploadImageResponse>(`/chat/get-upload-url`, { method: 'POST', body: payload, auth: true })
}
