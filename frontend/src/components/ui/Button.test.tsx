import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('is safe inside forms and keeps a 44px touch target', () => {
    render(<Button size="sm">保存</Button>)

    const button = screen.getByRole('button', { name: '保存' })
    expect(button).toHaveAttribute('type', 'button')
    expect(button).toHaveClass('min-h-11')
  })
})
