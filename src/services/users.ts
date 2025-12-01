import { request } from "@/lib/http"
import type { User } from "./auth"
import { pfpImage } from "@/assets/images"

export type LeaderBoardEntry = {
    nickname: string,
    pfp_path: string,
    description: string | null,
    elo: number
}

export async function getMe(): Promise<User> {
  return await request<User>('/users/me', { method: 'GET' })
}

export async function patchMe(payload: Partial<User>): Promise<User> {
  return  await request<User>('/users/me', { method: 'PATCH', body: payload })
}

export async function deleteMe(): Promise<void> {
  await request('/users/me', { method: 'DELETE' })
}

export async function getUser(id: string): Promise<User> {
  const user = await request<User>(`/users/${id}`)
  return {
    ...user,
    id: String(id),
  }
}

export async function getOnlineCount(): Promise<{count: number}>{
    return await request<{count: number}>('/users/online-count',{method: 'GET'})
  
export async function getLeaderBoard(num: number): Promise<LeaderBoardEntry[]> {
    const params = new URLSearchParams()
    params.set('n', String(num))
    const result = await request<LeaderBoardEntry[]>(`/users/leaderboard?${params.toString()}`,{method: 'GET'})
    return result.map(user => ({
        nickname: user.nickname,
        pfp_path: user.pfp_path || pfpImage,
        description: user.description,
        elo: Number(user.elo)
    }))
}