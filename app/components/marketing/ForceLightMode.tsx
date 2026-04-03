'use client'

import { useEffect } from 'react'

export function ForceLightMode() {
  useEffect(() => {
    const html = document.documentElement
    const wasDark = html.classList.contains('dark')

    if (wasDark) {
      html.classList.remove('dark')
    }

    return () => {
      if (wasDark) {
        html.classList.add('dark')
      }
    }
  }, [])

  return null
}
