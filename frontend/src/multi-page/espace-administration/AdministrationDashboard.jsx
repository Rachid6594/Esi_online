import { Building2 } from 'lucide-react'
import { getAuth } from '../../auth'

export default function AdministrationDashboard() {
  const auth = getAuth()
  const user = auth?.user
  const poste = user?.poste
  const displayName = user?.email?.split('@')[0] || user?.username || 'Administration'

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-xl bg-muted p-2.5 text-foreground">
          <Building2 className="h-7 w-7" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Tableau de bord � Administration de l&apos;�cole
          </h1>
          <p className="text-muted-foreground">
            Bienvenue, <span className="font-medium text-foreground">{displayName}</span>
            {poste && (
              <> � <span className="text-muted-foreground">{poste}</span></>
            )}.
          </p>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
        Espace r�serv� � l&apos;administration de l&apos;�cole. Contenu du tableau de bord � d�finir.
      </div>
    </div>
  )
}
