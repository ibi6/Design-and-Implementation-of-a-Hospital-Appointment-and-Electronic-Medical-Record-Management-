import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ErrorState } from './AsyncState'

describe('ErrorState', () => {
  it('announces the failure and exposes a retry action', async () => {
    const retry = vi.fn()
    render(<ErrorState message="无法加载预约" onRetry={retry} />)

    expect(screen.getByRole('alert')).toHaveTextContent('无法加载预约')
    await userEvent.click(screen.getByRole('button', { name: '重新加载' }))
    expect(retry).toHaveBeenCalledOnce()
  })
})
