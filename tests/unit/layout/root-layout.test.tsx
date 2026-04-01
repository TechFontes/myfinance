import { beforeEach, describe, expect, it, vi } from 'vitest'

const interMock = vi.hoisted(() => vi.fn(({ variable }: { variable: string }) => ({ variable })))
const soraMock = vi.hoisted(() => vi.fn(({ variable }: { variable: string }) => ({ variable })))
const manropeMock = vi.hoisted(() => vi.fn(({ variable }: { variable: string }) => ({ variable })))
const newsreaderMock = vi.hoisted(() => vi.fn(({ variable }: { variable: string }) => ({ variable })))

vi.mock('next/font/google', () => ({
  Inter: interMock,
  Sora: soraMock,
  Manrope: manropeMock,
  Newsreader: newsreaderMock,
}))

describe('root layout', () => {
  beforeEach(() => {
    vi.resetModules()
    interMock.mockClear()
    soraMock.mockClear()
    manropeMock.mockClear()
    newsreaderMock.mockClear()
  })

  it('uses Inter as the base font and Sora as the display accent', async () => {
    await import('@/layout')

    expect(interMock).toHaveBeenCalledWith(
      expect.objectContaining({
        variable: '--font-sans',
      }),
    )
    expect(soraMock).toHaveBeenCalledWith(
      expect.objectContaining({
        variable: '--font-serif',
      }),
    )
    expect(manropeMock).not.toHaveBeenCalled()
    expect(newsreaderMock).not.toHaveBeenCalled()
  })
})
