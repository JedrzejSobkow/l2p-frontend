import { pfpImage } from '@/assets/images'
import { request } from '../lib/http'
export type FriendshipStatus = 'pending' | 'accepted' | 'blocked'

export type Friendship = {
  friendship_id: string
  friend_user_id: string
  friend_nickname: string
  friend_pfp_path: string
  friend_description: string | null
  status: FriendshipStatus
  created_at: string
  is_requester: boolean
}

export type FriendResult = {
  user_id: string
  nickname: string
  pfp_path?: string
  description?: string
}

export type SearchFriendsPayload = {
  users: FriendResult[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export async function searchFriends(query: string, page: number = 1, pageSize: number = 20): Promise<SearchFriendsPayload> {
  const params = new URLSearchParams()
  params.set('q', query)
  params.set('page', page.toString())
  params.set('page_size', pageSize.toString())

  const res = await request<SearchFriendsPayload>(`/friends/search?${params.toString()}`, { method: 'GET', auth: true })
  return {
    ...res,
    users: res.users.map((user) => ({
      ...user,
      user_id: String(user.user_id),
      pfp_path: user.pfp_path ? String(user.pfp_path) : pfpImage,
    })),
  }
}

export async function sendFriendRequest(friend_user_id: string | number): Promise<{status: string, created_at: string}> {
  const normalizedId = String(friend_user_id)
  return await request<{status: string, created_at: string}>(`/friends/request`, {
    method: 'POST',
    body: { friend_user_id: normalizedId },
    auth: true,
  })
}

export async function acceptFriendRequest(friend_user_id: string | number): Promise<{status: string, created_at: string}> {
  const normalizedId = String(friend_user_id)
  return await request<{status: string, created_at: string}>(`/friends/accept`, {
    method: 'POST',
    body: { friend_user_id: normalizedId },
    auth: true,
  })
}

export async function declineFriendRequest(friend_user_id: string | number): Promise<void> {
  const normalizedId = String(friend_user_id)
  await request<void>(`/friends/${normalizedId}`, { method: 'DELETE', auth: true })
}

export async function deleteFriend(friend_user_id: string | number): Promise<void> {
  await declineFriendRequest(friend_user_id)
}

export async function getFriendsList(status?: FriendshipStatus): Promise<Friendship[]> {
  const params = new URLSearchParams()
  if (status) {
    params.set('status', status)
  }
  const query = params.toString()
  const path = query ? `/friends?${query}` : '/friends'
  const res = await request<Friendship[]>(path, { method: 'GET', auth: true })
  return res.map(friend => ({
    is_requester: Boolean(friend.is_requester),
    created_at: String(friend.created_at),
    friend_description: friend.friend_description,
    friend_nickname: String(friend.friend_nickname),
    status: friend.status as FriendshipStatus,
    friendship_id: String(friend.friendship_id),
    friend_user_id: String(friend.friend_user_id),
    friend_pfp_path: friend.friend_pfp_path
  }))
}
