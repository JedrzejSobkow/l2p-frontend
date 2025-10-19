import { request } from '../lib/http'

export type User = {
  id?: string | number
  username: string
  email?: string
  avatarUrl?: string
  roles?: string[]
}

export type LoginPayload = {
  username: string
  password: string
  remember?: boolean
}

export type RegisterPayload = {
  nickname: string
  email: string
  password: string
}


export async function login(payload: LoginPayload): Promise<User> {
  // OAuth2PasswordRequestForm (x-www-form-urlencoded)
  const form = new URLSearchParams()
  form.set('username', payload.username)
  form.set('password', payload.password)
  form.set('grant_type', 'password')
  if (payload.remember) form.set('scope', 'remember')

  const data = await request<any>('/auth/login', { method: 'POST', body: form, auth: false })
  if (data?.user) return data.user as User
  // Cookie-based session; try to fetch current user if available
  return await getMe().catch(() => ({ username: payload.username } as User))
}

export async function register(payload: RegisterPayload): Promise<User> {
  const body = {
    email: payload.email,
    nickname: payload.nickname,
    password: payload.password,
  }
  const data = await request<any>('/auth/register', { method: 'POST', body, auth: false })
  return (data?.user as User) ?? (await getMe().catch(() => null as unknown as User))
}

export async function getMe(): Promise<User> {
  return await request<User>('/users/me', { method: 'GET' })
}

export async function logout(): Promise<void> {
  await request('/auth/logout', { method: 'POST', auth: true })
}
