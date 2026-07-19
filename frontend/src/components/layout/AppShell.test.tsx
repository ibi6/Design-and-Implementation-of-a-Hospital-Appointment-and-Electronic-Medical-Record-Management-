import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AppShell } from './AppShell'

vi.mock('@/context/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: '1',
      username: 'patient',
      realName: '张小明',
      phone: '13800001111',
      role: 'PATIENT',
      status: 'ACTIVE',
      createdAt: '2026-07-19T00:00:00',
    },
    logout: vi.fn(),
  }),
}))

describe('AppShell', () => {
  it('does not expose an inert notification control', () => {
    render(
      <MemoryRouter>
        <AppShell nav={[]} title="患者中心">
          页面内容
        </AppShell>
      </MemoryRouter>,
    )

    expect(screen.queryByRole('button', { name: '通知' })).not.toBeInTheDocument()
    expect(screen.getByText('患者中心')).toBeInTheDocument()
  })
})
