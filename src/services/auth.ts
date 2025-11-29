import { request } from '../lib/http'
import { getMe } from './users'

export type User = {
  id?: string
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

export async function getGoogleAuthorizationUrl(scopes?: string[]): Promise<string> {
  const qs = new URLSearchParams()
  if (Array.isArray(scopes)) {
    for (const s of scopes) qs.append('scopes', s)
  }
  const path = '/auth/google/authorize' + (qs.toString() ? `?${qs.toString()}` : '')
  const data = await request<{ authorization_url: string }>(path, { method: 'GET', auth: false })
  return data.authorization_url
}


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

export async function createGuestSession(): Promise<User> {
  const response = await request<{ guest_id: string; nickname: string; expires_in: number }>(
    '/auth/guest/session',
    {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
      auth: false,
    }
  );

  return {
    id: response.guest_id,
    nickname: response.nickname,
    is_active: true,
    is_verified: false,
  };
}