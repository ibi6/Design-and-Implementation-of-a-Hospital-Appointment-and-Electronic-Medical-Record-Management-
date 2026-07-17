import { afterEach, describe, expect, it, vi } from 'vitest'
import { addDays, todayStr } from './utils'

describe('hospital calendar dates', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('uses the Asia/Shanghai calendar day around UTC midnight', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-16T16:30:00.000Z'))

    expect(todayStr()).toBe('2026-07-17')
    expect(addDays(new Date('2026-07-16T16:30:00.000Z'), 1)).toBe('2026-07-18')
  })
})
