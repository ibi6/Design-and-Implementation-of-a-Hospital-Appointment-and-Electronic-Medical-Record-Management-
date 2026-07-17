import { describe, expect, it } from 'vitest'
import { safeRedirectFor } from './auth-routing'

describe('safeRedirectFor', () => {
  it('keeps a same-role application path', () => {
    expect(safeRedirectFor('PATIENT', '/patient/records?from=login')).toBe(
      '/patient/records?from=login',
    )
  })

  it.each([
    ['/admin/users'],
    ['//example.com/steal'],
    ['https://example.com/steal'],
    ['\\example.com\\steal'],
    [null],
  ])('falls back to the role home for %s', (redirect) => {
    expect(safeRedirectFor('PATIENT', redirect)).toBe('/patient')
  })
})
