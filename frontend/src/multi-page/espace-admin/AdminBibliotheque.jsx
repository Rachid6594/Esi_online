import BibliothequeExplorer from '../../components/BibliothequeExplorer'
import { getAuth } from '../../auth'
import { Library } from 'lucide-react'

export default function AdminBibliotheque() {
  const auth = getAuth()
  const currentUser = auth?.user ?? null

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-xl bg-esi-orange/10 p-2.5 text-esi-orange">
          <Library className="h-7 w-7" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Bibliothèque Numérique</h1>
          <p className="text-muted-foreground text-sm">
            Modération et gestion de tous les documents déposés
          </p>
        </div>
      </div>

      <BibliothequeExplorer
        canUpload={true}
        isAdminView={true}
        currentUser={currentUser}
      />
    </div>
  )
}
