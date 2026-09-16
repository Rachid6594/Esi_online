import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <Button type="button" variant="ghost" size="icon" aria-label="Changer le thème" />
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  )
}

export function ThemeSelect() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return (
    <Select value={theme} onValueChange={setTheme}>
      <SelectTrigger className="w-[140px]" aria-label="Choisir le thème">
        <SelectValue placeholder="Thème" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="system">Système</SelectItem>
        <SelectItem value="light">Clair</SelectItem>
        <SelectItem value="dark">Sombre</SelectItem>
      </SelectContent>
    </Select>
  )
}
