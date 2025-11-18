import { request } from '../lib/http'

export type User = {
  id?: string | number
  nickname: string
  email?: string,
  is_active: boolean,
  is_verified: boolean,
  pfp_path?: string
  description?: string
}

export type LoginPayload = {
  email: string
  password: string
  remember?: boolean
}

export type RegisterPayload = {
  nickname: string
  email: string
  password: string
}

export type ForgotPasswordPayload = {
  email: string
}

export type ResetPasswordPayload = {
  token: string
  password: string
}

export type ActivateUserPayload = {
  token: string
}

// /auth/ endpoints


export async function login(payload: LoginPayload): Promise<User> {
  const form = new URLSearchParams()
  form.set('username', payload.email)
  form.set('password', payload.password)
  form.set('grant_type', 'password')
  if (payload.remember) form.set('scope', 'remember')

  await request<any>('/auth/login', { method: 'POST', body: form, auth: false })

  const user = await getMe().catch(() => ({ nickname: payload.email} as User))

  window.location.reload()
  
  return user
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

export async function logout(): Promise<void> {
  await request('/auth/logout', { method: 'POST', auth: true })
  window.location.reload()
}

export async function forgotPassword(payload: ForgotPasswordPayload): Promise<string | undefined> {
  const res = await request<string>('/auth/forgot-password', {
    method: 'POST',
    body: { email: payload.email },
    auth: false,
  })
  return res
}

export async function resetPassword(payload: ResetPasswordPayload): Promise<string | undefined> {
  const res = await request<string>('/auth/reset-password', {
    method: 'POST',
    body: { token: payload.token, password: payload.password },
    auth: false,
  })
  return res
}

export async function verifyUser(payload: ActivateUserPayload): Promise<string | undefined> {
  const res = await request<string>('/auth/verify', {
    method: 'POST',
    body: { token: payload.token},
    auth: false,
  })
  return res
}

// /users/ endpoints

export async function getMe(): Promise<User> {
  return await request<User>('/users/me', { method: 'GET' })
}

export async function patchMe(payload: Partial<User>): Promise<User> {
  return  await request<User>('/users/me', { method: 'PATCH', body: payload })
}

export async function deleteMe(): Promise<void> {
  await request('/users/me', { method: 'DELETE' })
}

