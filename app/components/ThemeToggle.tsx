"use client"

import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  function toggle() {
    const root = document.documentElement
    if (root.classList.contains('dark')) {
      root.classList.remove('dark')
      try {
        localStorage.setItem('theme', 'light')
      } catch {
        /* ignore */
      }
      setDark(false)
    } else {
      root.classList.add('dark')
      try {
        localStorage.setItem('theme', 'dark')
      } catch {
        /* ignore */
      }
      setDark(true)
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
        className="fixed bottom-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700/70 dark:hover:text-white"
    >
      <i className={dark ? 'bi bi-sun-fill' : 'bi bi-moon-fill'} aria-hidden="true" />
    </button>
  )
}
