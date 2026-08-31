import { useEffect } from 'react'

export default function Modal({ open, onClose, children }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="relative min-w-[320px] rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <button onClick={onClose} className="absolute top-2 right-2 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-gray-700 dark:hover:text-slate-200">✕</button>
        {children}
      </div>
    </div>
  )
}
