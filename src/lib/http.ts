const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ?? ''

export type ApiErrorShape = {
  status: number
  code?: string
  message: string
  fields?: Record<string, string>
}

export class ApiError extends Error implements ApiErrorShape {
  status: number
  code?: string
  fields?: Record<string, string>
  constructor(shape: ApiErrorShape) {
    super(shape.message)
    this.status = shape.status
    this.code = shape.code
    this.fields = shape.fields
  }
}


let unauthorizedHandler: (() => void) | null = null

export function onUnauthorized(cb: (() => void) | null) { unauthorizedHandler = cb }

type RequestOptions = {
  method?: string
  body?: any
  headers?: Record<string, string>
  auth?: boolean
  signal?: AbortSignal
}

function isFormData(body: any): body is FormData {
  return typeof FormData !== 'undefined' && body instanceof FormData
}

function isURLSearchParams(body: any): body is URLSearchParams {
  return typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams
}

function buildHeaders(body: any, extra?: Record<string, string>) {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(extra ?? {}),
  }
  if (body !== undefined && body !== null) {
    if (isFormData(body)) {
      // Let the browser set multipart boundary
    } else if (isURLSearchParams(body)) {
      headers['Content-Type'] = 'application/x-www-form-urlencoded'
    } else if (typeof body === 'string') {
      // Assume caller set proper content-type
    } else {
      headers['Content-Type'] = 'application/json'
    }
  }
  return headers
}

async function doFetch(path: string, opts: RequestOptions) {
  const url = API_BASE_URL ? API_BASE_URL.replace(/\/$/, '') + path : path
  const res = await fetch(url, {
    method: opts.method ?? 'GET',
    headers: buildHeaders(opts.body, opts.headers),
    credentials: 'include',
    body:
      opts.body === undefined || opts.body === null
        ? undefined
        : isFormData(opts.body) || isURLSearchParams(opts.body) || typeof opts.body === 'string'
        ? opts.body
        : JSON.stringify(opts.body),
    signal: opts.signal,
  })
  return res
}

async function parseError(res: Response): Promise<ApiError> {
  let payload: any = undefined
  try {
    payload = await res.json()
  } catch {
    // ignore
  }
  // Map FastAPI validation detail to field errors
  const code = payload?.code
  let message = payload?.message || payload?.detail || res.statusText || 'Request failed'
  let fields: Record<string, string> | undefined
  const detail = payload?.detail
  if (Array.isArray(detail)) {
    fields = {}
    for (const d of detail) {
      const loc = Array.isArray(d?.loc) ? d.loc : []
      const key = String(loc[loc.length - 1] ?? 'non_field')
      const msg = d?.msg || 'Invalid value'
      fields[key] = msg
    }
    // Prefer a specific message if no generic message was given
    if (!payload?.message) {
      message = fields['non_field'] || fields['detail'] || Object.values(fields)[0] || message
    }
  }
  if (payload?.errors && typeof payload.errors === 'object') {
    fields = { ...(fields ?? {}), ...(payload.errors as Record<string, string>) }
  }
  return new ApiError({ status: res.status, code, message, fields })
}

export async function request<T = any>(path: string, options: RequestOptions = {}): Promise<T> {
  const res = await doFetch(path, options)

  if(res.status === 401){
    unauthorizedHandler?.();
    throw await parseError(res)
  }
  if (!res.ok) {
    throw await parseError(res)
  }
  // Try to parse JSON; allow 204
  if (res.status === 204) return undefined as unknown as T
  try {
    return (await res.json()) as T
  } catch {
    // Non-JSON response
    return undefined as unknown as T
  }
}
