'use client'

import { useEffect } from 'react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastProps {
  id: string
  type: ToastType
  message: string
  duration?: number
  onClose: () => void
}

const ICONS: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  warning: '!',
  info: 'i',
}

const STYLES: Record<ToastType, { bg: string; border: string; color: string; icon: string }> = {
  success: {
    bg: 'var(--success-light)',
    border: 'var(--success-border)',
    color: 'var(--success)',
    icon: 'var(--success)',
  },
  error: {
    bg: 'var(--error-light)',
    border: 'var(--error-border)',
    color: 'var(--error)',
    icon: 'var(--error)',
  },
  warning: {
    bg: 'var(--warning-light)',
    border: 'var(--warning-border)',
    color: 'var(--warning)',
    icon: 'var(--warning)',
  },
  info: {
    bg: 'var(--institutional-light)',
    border: 'var(--institutional)',
    color: 'var(--institutional)',
    icon: 'var(--institutional)',
  },
}

export function Toast({ id, type, message, duration = 4000, onClose }: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const styles = STYLES[type]

  return (
    <div
      className="pointer-events-auto flex w-full max-w-md items-center gap-3 p-4"
      role="alert"
      style={{
        backgroundColor: styles.bg,
        borderLeft: `3px solid ${styles.border}`,
        borderRadius: 'var(--radius-md)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      }}
    >
      <span
        className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold"
        style={{
          backgroundColor: styles.icon,
          color: 'var(--text-inverse)',
        }}
      >
        {ICONS[type]}
      </span>
      <p
        className="flex-1 text-sm font-medium"
        style={{ color: styles.color }}
      >
        {message}
      </p>
      <button
        onClick={onClose}
        className="ml-auto flex-shrink-0 rounded p-1 transition-colors"
        style={{
          color: styles.color,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent'
        }}
        aria-label="Fermer"
      >
        <svg
          className="h-4 w-4"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  )
}

export function ToastContainer({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 flex flex-col items-end justify-start gap-4 p-6"
      aria-live="polite"
      aria-atomic="true"
    >
      {children}
    </div>
  )
}
