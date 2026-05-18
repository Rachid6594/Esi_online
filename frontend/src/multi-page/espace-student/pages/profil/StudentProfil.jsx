import { useState } from 'react'
import { User, Mail, BookOpen, GraduationCap, Hash, Edit2, Check, X } from 'lucide-react'
import { getAuth, setAuth } from '../../../../auth'
import InfoRow from './components/InfoRow'
import FormField from './components/FormField'

export default function StudentProfil() {
  const auth = getAuth()
  const user = auth?.user || {}
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ first_name: user.first_name || '', last_name: user.last_name || '', email: user.email || '' })
  const [saved, setSaved] = useState(false)

  function handleSave() {
    const updated = { ...user, ...form }; setAuth(updated, auth?.access, auth?.refresh); setEditing(false); setSaved(true); setTimeout(() => setSaved(false), 3500)
  }
  function handleCancel() { setForm({ first_name: user.first_name || '', last_name: user.last_name || '', email: user.email || '' }); setEditing(false) }

  const initials = `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() || user.email?.[0]?.toUpperCase() || 'É'
  const displayName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email || 'Étudiant'

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-xl bg-slate-100 p-2.5 text-slate-700 dark:bg-gray-700 dark:text-slate-300"><User className="h-7 w-7" strokeWidth={1.5} /></div>
        <div><h1 className="text-xl font-semibold text-slate-900 sm:text-2xl dark:text-white">Mon profil</h1><p className="text-sm text-slate-600 sm:text-base dark:text-slate-300">Vos informations personnelles</p></div>
      </div>
      {saved && <div className="mb-5 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-700 dark:border-green-800/50 dark:bg-green-900/20 dark:text-green-400"><Check className="h-4 w-4 shrink-0" />Profil mis à jour avec succès.</div>}
      <div className="space-y-6">
        <div className="flex flex-col items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:gap-5 sm:p-6 dark:border-gray-600 dark:bg-gray-800">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-esi-primary text-xl font-bold text-white sm:h-16 sm:w-16 sm:text-2xl">{initials}</div>
          <div className="text-center sm:text-left"><p className="text-lg font-semibold text-slate-900 sm:text-xl dark:text-white">{displayName}</p><p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>{user.matricule && <p className="mt-1 flex items-center justify-center gap-1 text-xs text-slate-400 sm:justify-start"><Hash className="h-3 w-3" />{user.matricule}</p>}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 dark:border-gray-600 dark:bg-gray-800">
          <div className="mb-4 flex flex-col gap-2 sm:mb-5 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-semibold text-slate-900 dark:text-white">Informations personnelles</h2>
            {!editing ? (
              <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 dark:border-gray-600 dark:text-slate-300 dark:hover:bg-gray-700"><Edit2 className="h-3.5 w-3.5" /> Modifier</button>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={handleSave} className="flex items-center gap-1.5 rounded-lg bg-esi-primary px-3 py-1.5 text-xs font-medium text-white transition hover:bg-esi-primary-hover"><Check className="h-3.5 w-3.5" /> Enregistrer</button>
                <button onClick={handleCancel} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 dark:border-gray-600 dark:text-slate-300 dark:hover:bg-gray-700"><X className="h-3.5 w-3.5" /> Annuler</button>
              </div>
            )}
          </div>
          <div className="space-y-4">
            {editing ? (
              <>
                <FormField label="Prénom" icon={User}><input value={form.first_name} onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-esi-primary focus:ring-2 focus:ring-esi-primary/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white" placeholder="Votre prénom" /></FormField>
                <FormField label="Nom" icon={User}><input value={form.last_name} onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-esi-primary focus:ring-2 focus:ring-esi-primary/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white" placeholder="Votre nom" /></FormField>
                <FormField label="Email" icon={Mail}><input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-esi-primary focus:ring-2 focus:ring-esi-primary/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white" placeholder="votre@email.dz" /></FormField>
              </>
            ) : (
              <><InfoRow icon={User} label="Prénom" value={user.first_name || '—'} /><InfoRow icon={User} label="Nom" value={user.last_name || '—'} /><InfoRow icon={Mail} label="Email" value={user.email || '—'} /></>
            )}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 dark:border-gray-600 dark:bg-gray-800">
          <h2 className="mb-5 font-semibold text-slate-900 dark:text-white">Informations académiques</h2>
          <div className="space-y-4"><InfoRow icon={Hash} label="Matricule" value={user.matricule || '—'} /><InfoRow icon={GraduationCap} label="Niveau" value={user.niveau || '—'} /><InfoRow icon={BookOpen} label="Filière" value={user.filiere || '—'} /></div>
        </div>
      </div>
    </div>
  )
}
