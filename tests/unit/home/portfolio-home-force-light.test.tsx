// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

vi.mock('next/image', () => ({
  default: ({ alt, ...props }: { alt: string; [key: string]: unknown }) => (
    <img alt={alt} {...(props as React.ImgHTMLAttributes<HTMLImageElement>)} />
  ),
}))

describe('PortfolioHome', () => {
  afterEach(() => {
    cleanup()
  })

  it('applies force-light class to the outermost wrapper', async () => {
    const { PortfolioHome } = await import('@/components/marketing/PortfolioHome')
    const { container } = render(<PortfolioHome />)
    const main = container.querySelector('main')
    expect(main).toHaveClass('force-light')
  }, 10000)
})
