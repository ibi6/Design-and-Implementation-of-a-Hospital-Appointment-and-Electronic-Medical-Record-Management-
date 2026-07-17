import { beforeEach, describe, expect, it, vi } from 'vitest'
import { http } from './http'

describe('http', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('uses same-origin cookies and never reads a legacy localStorage token', async () => {
    localStorage.setItem('hospital_token', 'legacy-exposed-token')
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ code: 0, message: 'ok', data: { ready: true } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await expect(http<{ ready: boolean }>('/api/health')).resolves.toEqual({ ready: true })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, request] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/health')
    expect(request.credentials).toBe('include')
    expect(new Headers(request.headers).has('Authorization')).toBe(false)
  })

  it('keeps the server envelope message for non-success HTTP responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ code: 403, message: '无权限访问', data: null }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    )

    await expect(http('/api/admin')).rejects.toThrow('无权限访问')
  })

  it('returns a stable diagnostic when the response is not JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('Bad gateway', { status: 502 })),
    )

    await expect(http('/api/health')).rejects.toThrow('请求失败 (502)')
  })
})
