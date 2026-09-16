import { LayoutDashboard } from 'lucide-react'

export default function AdminDashboard() {
  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-xl bg-muted p-2.5 text-foreground">
          <LayoutDashboard className="h-7 w-7" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Tableau de bord</h1>
          <p className="text-muted-foreground">Bienvenue dans l&apos;espace d&apos;administration ESI Online.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">� venir</p>
          <p className="mt-1 text-lg font-semibold text-foreground">Statistiques</p>
          <p className="mt-1 text-sm text-muted-foreground">Vue d&apos;ensemble et indicateurs.</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">� venir</p>
          <p className="mt-1 text-lg font-semibold text-foreground">Utilisateurs</p>
          <p className="mt-1 text-sm text-muted-foreground">Gestion des comptes et r�les.</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">� venir</p>
          <p className="mt-1 text-lg font-semibold text-foreground">Param�tres</p>
          <p className="mt-1 text-sm text-muted-foreground">Configuration de la plateforme.</p>
        </div>
      </div>
    </div>
  )
}
