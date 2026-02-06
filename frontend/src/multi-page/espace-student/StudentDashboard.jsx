import { Link } from 'react-router-dom'
import { GraduationCap, BookOpen, FileText, Calendar, User, ChevronRight } from 'lucide-react'
import { getAuth } from '../../auth'

const cards = [
  { title: 'Cours', description: 'Accéder à vos cours et supports', icon: BookOpen, to: '/home/cours', color: 'bg-[var(--color-esi-orange-light)] text-[var(--color-esi-orange)]' },
  { title: 'Documents', description: 'Télécharger les documents de la formation', icon: FileText, to: '/home/documents', color: 'bg-blue-100 text-blue-700' },
  { title: 'Emploi du temps', description: 'Consulter votre planning', icon: Calendar, to: '/home/emploi-du-temps', color: 'bg-green-100 text-green-700' },
  { title: 'Mon profil', description: 'Modifier vos informations personnelles', icon: User, to: '/home/profil', color: 'bg-slate-100 text-slate-700' },
]

export default function StudentDashboard() {
  const auth = getAuth()
  const userName = auth?.user?.first_name || auth?.user?.email?.split('@')[0] || 'Étudiant'

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-xl bg-[var(--color-esi-orange-light)] p-2.5 text-[var(--color-esi-orange)]">
          <GraduationCap className="h-7 w-7" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Tableau de bord</h1>
          <p className="text-slate-600">
            Bienvenue, <span className="font-medium text-slate-800">{userName}</span>. Accédez à vos ressources ci-dessous.
          </p>
        </div>
      </div>

      <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-sm font-medium text-slate-500">Votre espace</h2>
        <p className="text-slate-700">
          Utilisez les cartes ci-dessous pour accéder aux cours, documents, emploi du temps et à votre profil.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ title, description, icon: Icon, to, color }) => (
          <Link
            key={to}
            to={to}
            className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-[var(--color-esi-primary)]/30 hover:shadow-md"
          >
            <div className={`mb-4 inline-flex rounded-lg p-2.5 ${color}`}>
              <Icon className="h-6 w-6" strokeWidth={1.5} />
            </div>
            <h2 className="mb-1 text-lg font-semibold text-slate-900">{title}</h2>
            <p className="mb-4 flex-1 text-sm text-slate-600">{description}</p>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-esi-primary)]">
              Accéder <ChevronRight className="h-4 w-4" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
