// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/components/layout/Header', () => ({
  Header: ({ user }: { user: { name: string | null; email: string } }) => (
    <header data-testid="header">{user.name ?? user.email}</header>
  ),
}))

vi.mock('@/components/layout/SideBar', () => ({
  Sidebar: ({ user }: { user: { name: string | null; email: string } }) => (
    <aside data-testid="sidebar">{user.name ?? user.email}</aside>
  ),
}))

import { Shell } from '@/components/layout/Shell'

afterEach(() => {
  cleanup()
})

describe('shell', () => {
  it('uses a dedicated shell frame for a brighter light-mode surface', () => {
    render(
      <Shell
        user={{ id: '1', name: 'Daniel', email: 'daniel@example.com' }}
      >
        <section data-testid="content">Conteúdo</section>
      </Shell>,
    )

    const frame = screen.getByTestId('shell-frame')
    const content = screen.getByTestId('shell-content')

    expect(frame).toHaveClass('shell-frame')
    expect(content).toHaveClass('shell-content')
    expect(screen.getByTestId('header')).toBeInTheDocument()
    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('content')).toBeInTheDocument()
  })

  it('passes the server-provided user to header and sidebar', () => {
    render(
      <Shell
        user={{ id: '1', name: 'Daniel', email: 'daniel@example.com' }}
      >
        <section>Conteúdo</section>
      </Shell>,
    )

    expect(screen.getAllByText('Daniel')).toHaveLength(2)
  })
})
