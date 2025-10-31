import { request } from "http";
import { data } from "react-router";
import {io,Socket} from "socket.io-client";

const URL = `${import.meta.env.VITE_API_BASE_URL}/chat`;

export type Message = {
    id: string | number,
    sender_id: string | number,
    sender_nickname: string,
    content: string,
    created_at: string,
    is_mine: boolean,
    image_url: string
}

export type ConversationHistoryPayload = {
    messages: Message[],
    total: number,
    limit: number,
    has_more: boolean,
    next_cursor: number,
    friend_user_id: string | number,
    friend_nickname: string
}

export type Conversation = {
    friendship_id: string | number,
    friend_id: string | number,
    friend_nickname: string,
    friend_email: string,
    last_message_time: string,
    last_message_content: string,
    last_message_is_mine: boolean,
    unread_count: number
}

type UploadImagePayload = {
    friend_user_id: string | number,
    filename: string,
    content_type: string,
    content: string
}

type UploadImageResponse = {
    upload_url: string,
    object_name: string,
    image_path: string,
    expires_in_minutes: number
}



let socket: Socket | null = null;

export const connectChatSocket = (token: string) => {
    socket = io(URL, {
        path: '/socket.io',
        transports: ['websocket'],
        auth: {token},
    })
    socket.on('connect', () => {})
    socket.on('error',(payload) => {})
    socket.on('message', (msg)=>{})
    socket.on('user_typing', (data)=>{})
    socket.on('conversation_updated', (data)=>{})

    return socket;
}

export const disconnectChatSocket = () => {
    if(socket) {
        socket.disconnect();
        socket = null;
    }
}

export const sendMessage = (payload: any) => {
    socket?.emit('send_message', payload);
}

export const sendTyping = (payload: any) => {
    socket?.emit('typing', payload);
}

export async function getMessages(friend_user_id: string | number, before_message_id?: string | number, limit: number = 50): Promise<ConversationHistoryPayload> {
    const params = new URLSearchParams()
    if (before_message_id) {
        params.set('before_message_id', String(before_message_id))
    }
    params.set('limit', String(limit))
    
    const data = await request<ConversationHistoryPayload>(`/chat/history/${friend_user_id}${params.toString()}`, { method: 'GET', auth: true })
    return data
}

export async function getConversations(): Promise<{conversations: Conversation[]}> {
    const data = await request<{conversations: Conversation[]}>(`/chat/conversations`, { method: 'GET', auth: true })
    return data
}

export async function uploadImage(payload: UploadImagePayload): Promise<UploadImageResponse> {
    const data = await request<UploadImageResponse>(`/chat/get-upload-url`, { method: 'POST', body: payload, auth: true })
    
}