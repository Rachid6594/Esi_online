import { useState } from 'react'
import { User, Mail, BookOpen, GraduationCap, Hash, Edit2, Check, X } from 'lucide-react'
import { getAuth, setAuth } from '../../../../auth'
import InfoRow from './components/InfoRow'
import FormField from './components/FormField'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function StudentProfil() {
  const auth = getAuth()
  const user = auth?.user || {}
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ first_name: user.first_name || '', last_name: user.last_name || '', email: user.email || '' })
  const [saved, setSaved] = useState(false)

  function handleSave() {
    const updated = { ...user, ...form }
    setAuth(updated, auth?.access, auth?.refresh)
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3500)
  }
  function handleCancel() {
    setForm({ first_name: user.first_name || '', last_name: user.last_name || '', email: user.email || '' })
    setEditing(false)
  }

  const initials = `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() || user.email?.[0]?.toUpperCase() || 'É'
  const displayName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email || 'Étudiant'

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-xl bg-muted p-2.5 text-muted-foreground">
          <User className="h-7 w-7" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground sm:text-2xl">Mon profil</h1>
          <p className="text-sm text-muted-foreground sm:text-base">Vos informations personnelles</p>
        </div>
      </div>
      {saved && (
        <Alert className="mb-5 border-border bg-muted text-foreground">
          <Check className="h-4 w-4" />
          <AlertDescription>Profil mis à jour avec succès.</AlertDescription>
        </Alert>
      )}
      <div className="space-y-6">
        <Card className="shadow-sm">
          <CardContent className="flex flex-col items-center gap-4 pt-6 sm:flex-row sm:items-center sm:gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground sm:h-16 sm:w-16 sm:text-2xl">
              {initials}
            </div>
            <div className="text-center sm:text-left">
              <p className="text-lg font-semibold text-foreground sm:text-xl">{displayName}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              {user.matricule && (
                <p className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground sm:justify-start">
                  <Hash className="h-3 w-3" />{user.matricule}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>Informations personnelles</CardTitle>
              {!editing ? (
                <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                  <Edit2 className="h-3.5 w-3.5" /> Modifier
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={handleSave}>
                    <Check className="h-3.5 w-3.5" /> Enregistrer
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    <X className="h-3.5 w-3.5" /> Annuler
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {editing ? (
                <>
                  <FormField label="Prénom" icon={User}>
                    <Input
                      value={form.first_name}
                      onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
                      placeholder="Votre prénom"
                    />
                  </FormField>
                  <FormField label="Nom" icon={User}>
                    <Input
                      value={form.last_name}
                      onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
                      placeholder="Votre nom"
                    />
                  </FormField>
                  <FormField label="Email" icon={Mail}>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="votre@email.dz"
                    />
                  </FormField>
                </>
              ) : (
                <>
                  <InfoRow icon={User} label="Prénom" value={user.first_name || '—'} />
                  <InfoRow icon={User} label="Nom" value={user.last_name || '—'} />
                  <InfoRow icon={Mail} label="Email" value={user.email || '—'} />
                </>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Informations académiques</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow icon={Hash} label="Matricule" value={user.matricule || '—'} />
            <InfoRow icon={GraduationCap} label="Niveau" value={user.niveau || '—'} />
            <InfoRow icon={BookOpen} label="Filière" value={user.filiere || '—'} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
