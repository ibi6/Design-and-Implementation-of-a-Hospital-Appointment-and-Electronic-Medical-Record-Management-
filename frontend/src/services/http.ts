const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'

export type ApiEnvelope<T> = {
  code: number
  message: string
  data: T
}

function getToken() {
  return localStorage.getItem('hospital_token') || ''
}

export function setToken(token: string | null) {
  if (!token) localStorage.removeItem('hospital_token')
  else localStorage.setItem('hospital_token', token)
}

export async function http<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {})
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }
  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  let payload: ApiEnvelope<T> | null = null
  try {
    payload = (await res.json()) as ApiEnvelope<T>
  } catch {
    throw new Error(`请求失败 (${res.status})`)
  }

  if (!payload || typeof payload.code !== 'number') {
    throw new Error('响应格式错误')
  }
  if (payload.code !== 0) {
    throw new Error(payload.message || '请求失败')
  }
  return payload.data
}

export function qs(params: Record<string, string | number | boolean | undefined | null>) {
  const sp = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return
    sp.set(k, String(v))
  })
  const s = sp.toString()
  return s ? `?${s}` : ''
}
