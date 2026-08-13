'use client'

import { useEffect, useState } from 'react'

export default function WelcomePopup() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const hasSeen = localStorage.getItem('welcomePopupSeen')
    if (!hasSeen) {
      // Small delay to let the page render first
      const timer = setTimeout(() => setShow(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleClose = () => {
    setShow(false)
    localStorage.setItem('welcomePopupSeen', 'true')
  }

  if (!show) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="welcome-title" className="mb-4 text-xl font-semibold text-slate-900 dark:text-white">
          Welcome to Free Stream
        </h2>
        <p className="mb-6 text-slate-600 dark:text-slate-300 leading-relaxed">
          Some channels may not work properly. We are currently in development
          and working to fix these issues. Thank you for your patience!
        </p>
        <button
          type="button"
          onClick={handleClose}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
        >
          Got it
        </button>
      </div>
    </div>
  )
}