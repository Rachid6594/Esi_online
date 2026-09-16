import { useRef } from 'react'
import { Upload } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

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
    <Card
      className={`cursor-pointer border-dashed shadow-none transition-colors ${disabled ? 'opacity-50' : 'hover:bg-muted/50'}`}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => !disabled && inputRef.current?.click()}
    >
      <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleChange}
          disabled={disabled}
        />
        <Upload className="h-5 w-5 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Glissez-déposez un fichier CSV ici ou cliquez pour sélectionner.
        </p>
      </CardContent>
    </Card>
  )
}
