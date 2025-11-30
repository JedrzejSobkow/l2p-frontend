import { request } from "@/lib/http";

export async function getOnlineCount(): Promise<{count: number}>{
    return await request<{count: number}>('/users/online-count',{method: 'GET'})
}