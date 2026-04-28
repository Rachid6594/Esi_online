import { useRef } from 'react'

export default function CsvImportZone({ onImport, disabled }) {
  const inputRef = useRef()

  const handleDrop = (e) => {
    e.preventDefault()
    if (disabled) return
    const file = e.dataTransfer.files[0]
    if (file && file.type === 'text/csv') {
      onImport(file)
    }
  }
  const handleChange = (e) => {
    const file = e.target.files[0]
    if (file && file.type === 'text/csv') {
      onImport(file)
    }
  }
  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${disabled ? 'opacity-50' : 'hover:border-blue-400'}`}
      onClick={() => !disabled && inputRef.current.click()}
      style={{ background: '#fafbfc' }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        style={{ display: 'none' }}
        onChange={handleChange}
        disabled={disabled}
      />
      <p className="text-sm text-slate-600">Glissez-déposez un fichier CSV ici ou cliquez pour sélectionner.</p>
    </div>
  )
}
