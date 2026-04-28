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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px] relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-slate-400 hover:text-slate-700">✕</button>
        {children}
      </div>
    </div>
  )
}
