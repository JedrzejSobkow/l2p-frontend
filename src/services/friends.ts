import { request } from "../lib/http"

export type Friendship = {
    friend_user_id: string | number,
    friend_nickname: string,
    friend_pfp_path: string,
    friend_description: string,
    status: string,
    created_at: string,
    is_requester: boolean
}

export type FriendResult = {
    user_id: string | number,
    nickname: string,
    pfp_path: string,
    description: string
}

export type SearchFriendsPayload = {
    users: FriendResult[],
    total: number,
    page: number,
    page_size: boolean,
    total_pages: number
}

export async function searchFriends(query: string, page_number: number, page_size: number): Promise<SearchFriendsPayload> {
    const params = new URLSearchParams()
    params.set('query', query)
    params.set('page_number', page_number.toString())
    params.set('page_size', page_size.toString())

    const data = await request<SearchFriendsPayload>(`/friends/search?${params.toString()}`, { method: 'GET', auth: true })
    return data
}

export async function sendFriendRequest(friend_user_id: number): Promise<void> {
    await request<void>(`/friends/request`, { method: 'POST', body: { friend_user_id }, auth: true })
}

export async function acceptFriendRequest(friend_user_id: number): Promise<void> {
    await request<void>(`/friends/accept`, { method: 'POST', body: { friend_user_id }, auth: true })
}

export async function declineFriendRequest(friend_user_id: number): Promise<void> {
    const params = new URLSearchParams()
    params.set('friend_user_id', friend_user_id.toString())
    await request<void>(`/friends?${params.toString()}`, { method: 'DELETE', auth: true })
}

export async function deleteFriend(friend_user_id: number): Promise<void> {
    await declineFriendRequest(friend_user_id)
}

export async function getFriendsList(status?: string): Promise<Friendship[]> {
    const params = new URLSearchParams()
    if (status) {
        params.set('status_filter', status)
    }
    const data = await request<Friendship[]>(`/friends?${params.toString()}`, { method: 'GET', auth: true })
    return data
}