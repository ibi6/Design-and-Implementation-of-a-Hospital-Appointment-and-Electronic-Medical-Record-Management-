const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '')
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS', 'TRACE'])

type CsrfState = {
  headerName: string
  token: string
}

let csrfState: CsrfState | null = null
let csrfRequest: Promise<CsrfState> | null = null

export type ApiEnvelope<T> = {
  code: number
  message: string
  data: T
}

async function getCsrfState(): Promise<CsrfState> {
  if (csrfState) return csrfState
  if (csrfRequest) return csrfRequest

  csrfRequest = (async () => {
    const response = await fetch(`${API_BASE}/api/auth/csrf`, { credentials: 'include' })
    let payload: ApiEnvelope<CsrfState> | null = null
    try {
      payload = (await response.json()) as ApiEnvelope<CsrfState>
    } catch {
      throw new Error(`无法建立安全请求 (${response.status})`)
    }
    if (
      !response.ok ||
      !payload ||
      payload.code !== 0 ||
      !payload.data?.headerName ||
      !payload.data?.token
    ) {
      throw new Error(payload?.message || '无法建立安全请求')
    }
    csrfState = payload.data
    return payload.data
  })()

  try {
    return await csrfRequest
  } finally {
    csrfRequest = null
  }
}

export async function http<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {})
  const method = (options.method || 'GET').toUpperCase()
  const authorization = headers.get('Authorization')
  if (!SAFE_METHODS.has(method) && !authorization?.startsWith('Bearer ')) {
    const csrf = await getCsrfState()
    headers.set(csrf.headerName, csrf.token)
  }
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',
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
  if (!res.ok || payload.code !== 0) {
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
