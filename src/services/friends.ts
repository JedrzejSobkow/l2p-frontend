import { request } from '../lib/http'
export type FriendshipStatus = 'pending' | 'accepted' | 'blocked'

export type Friendship = {
  friendship_id: string
  friend_user_id: string
  friend_nickname: string
  friend_pfp_path: string
  friend_description?: string
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

  const res =  await request<SearchFriendsPayload>(`/friends/search?${params.toString()}`, { method: 'GET', auth: true })
  return res
}

export async function sendFriendRequest(friend_user_id: string | number): Promise<{status: string, created_at: string}> {
  return await request<{status: string, created_at: string}>(`/friends/request`, {
    method: 'POST',
    body: { friend_user_id },
    auth: true,
  })
}

export async function acceptFriendRequest(friend_user_id: string | number): Promise<{status: string, created_at: string}> {
  return await request<{status: string, created_at: string}>(`/friends/accept`, {
    method: 'POST',
    body: { friend_user_id },
    auth: true,
  })
}

export async function declineFriendRequest(friend_user_id: string | number): Promise<void> {
  await request<void>(`/friends/${friend_user_id.toString()}`, { method: 'DELETE', auth: true })
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
    ...friend,
    friend_pfp_path: friend.friend_pfp_path
  })) };

