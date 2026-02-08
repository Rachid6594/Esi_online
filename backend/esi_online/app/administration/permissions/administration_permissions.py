"""
Permissions pour l'application administration.
"""
from rest_framework import permissions


class CanViewAdministration(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_staff or request.user.has_perm("administration.view_administration")
        )


class CanCreateAdministration(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_staff or request.user.has_perm("administration.add_administration")
        )


class CanUpdateAdministration(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_staff or request.user.has_perm("administration.change_administration")
        )


class CanDeleteAdministration(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_staff or request.user.has_perm("administration.delete_administration")
        )


# --- AnneeAcademique ---
class CanViewAnneeAcademique(permissions.BasePermission):
    """Lecture (GET) : is_staff ou permission view_anneeacademique."""
    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.view_anneeacademique")
            )
        return True


class CanCreateAnneeAcademique(permissions.BasePermission):
    """Création (POST) : is_staff ou permission add_anneeacademique."""
    def has_permission(self, request, view):
        if request.method == "POST":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.add_anneeacademique")
            )
        return True


class CanUpdateAnneeAcademique(permissions.BasePermission):
    """Modification (PUT, PATCH) : is_staff ou permission change_anneeacademique."""
    def has_permission(self, request, view):
        if request.method in ("PUT", "PATCH"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.change_anneeacademique")
            )
        return True


class CanDeleteAnneeAcademique(permissions.BasePermission):
    """Suppression (DELETE) : is_staff ou permission delete_anneeacademique."""
    def has_permission(self, request, view):
        if request.method == "DELETE":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.delete_anneeacademique")
            )
        return True


# --- Niveau ---
class CanViewNiveau(permissions.BasePermission):
    """Lecture (GET) : is_staff ou permission view_niveau."""
    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.view_niveau")
            )
        return True


class CanCreateNiveau(permissions.BasePermission):
    """Création (POST) : is_staff ou permission add_niveau."""
    def has_permission(self, request, view):
        if request.method == "POST":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.add_niveau")
            )
        return True


class CanUpdateNiveau(permissions.BasePermission):
    """Modification (PUT, PATCH) : is_staff ou permission change_niveau."""
    def has_permission(self, request, view):
        if request.method in ("PUT", "PATCH"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.change_niveau")
            )
        return True


class CanDeleteNiveau(permissions.BasePermission):
    """Suppression (DELETE) : is_staff ou permission delete_niveau."""
    def has_permission(self, request, view):
        if request.method == "DELETE":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.delete_niveau")
            )
        return True


# --- Filiere ---
class CanViewFiliere(permissions.BasePermission):
    """Lecture (GET) : is_staff ou permission view_filiere."""
    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.view_filiere")
            )
        return True


class CanCreateFiliere(permissions.BasePermission):
    """Création (POST) : is_staff ou permission add_filiere."""
    def has_permission(self, request, view):
        if request.method == "POST":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.add_filiere")
            )
        return True


class CanUpdateFiliere(permissions.BasePermission):
    """Modification (PUT, PATCH) : is_staff ou permission change_filiere."""
    def has_permission(self, request, view):
        if request.method in ("PUT", "PATCH"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.change_filiere")
            )
        return True


class CanDeleteFiliere(permissions.BasePermission):
    """Suppression (DELETE) : is_staff ou permission delete_filiere."""
    def has_permission(self, request, view):
        if request.method == "DELETE":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.delete_filiere")
            )
        return True


# --- Classe ---
class CanViewClasse(permissions.BasePermission):
    """Lecture (GET) : is_staff ou permission view_classe."""
    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.view_classe")
            )
        return True


class CanCreateClasse(permissions.BasePermission):
    """Création (POST) : is_staff ou permission add_classe."""
    def has_permission(self, request, view):
        if request.method == "POST":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.add_classe")
            )
        return True


class CanUpdateClasse(permissions.BasePermission):
    """Modification (PUT, PATCH) : is_staff ou permission change_classe."""
    def has_permission(self, request, view):
        if request.method in ("PUT", "PATCH"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.change_classe")
            )
        return True


class CanDeleteClasse(permissions.BasePermission):
    """Suppression (DELETE) : is_staff ou permission delete_classe."""
    def has_permission(self, request, view):
        if request.method == "DELETE":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.delete_classe")
            )
        return True


# --- Matiere ---
class CanViewMatiere(permissions.BasePermission):
    """Lecture (GET) : is_staff ou permission view_matiere."""
    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.view_matiere")
            )
        return True


class CanCreateMatiere(permissions.BasePermission):
    """Création (POST) : is_staff ou permission add_matiere."""
    def has_permission(self, request, view):
        if request.method == "POST":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.add_matiere")
            )
        return True


class CanUpdateMatiere(permissions.BasePermission):
    """Modification (PUT, PATCH) : is_staff ou permission change_matiere."""
    def has_permission(self, request, view):
        if request.method in ("PUT", "PATCH"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.change_matiere")
            )
        return True


class CanDeleteMatiere(permissions.BasePermission):
    """Suppression (DELETE) : is_staff ou permission delete_matiere."""
    def has_permission(self, request, view):
        if request.method == "DELETE":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.delete_matiere")
            )
        return True


# --- AdministrationEcole ---
class CanViewAdministrationEcole(permissions.BasePermission):
    """Lecture (GET) : is_staff ou permission view_administrationecole."""
    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.view_administrationecole")
            )
        return True


class CanCreateAdministrationEcole(permissions.BasePermission):
    """Création (POST) : is_staff ou permission add_administrationecole."""
    def has_permission(self, request, view):
        if request.method == "POST":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.add_administrationecole")
            )
        return True


class CanUpdateAdministrationEcole(permissions.BasePermission):
    """Modification (PUT, PATCH) : is_staff ou permission change_administrationecole."""
    def has_permission(self, request, view):
        if request.method in ("PUT", "PATCH"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.change_administrationecole")
            )
        return True


class CanDeleteAdministrationEcole(permissions.BasePermission):
    """Suppression (DELETE) : is_staff ou permission delete_administrationecole."""
    def has_permission(self, request, view):
        if request.method == "DELETE":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.delete_administrationecole")
            )
        return True


# --- DroitAdministration ---
class CanViewDroitAdministration(permissions.BasePermission):
    """Lecture (GET) : is_staff ou permission view_droitadministration."""
    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.view_droitadministration")
            )
        return True


class CanCreateDroitAdministration(permissions.BasePermission):
    """Création (POST) : is_staff ou permission add_droitadministration."""
    def has_permission(self, request, view):
        if request.method == "POST":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.add_droitadministration")
            )
        return True


class CanUpdateDroitAdministration(permissions.BasePermission):
    """Modification (PUT, PATCH) : is_staff ou permission change_droitadministration."""
    def has_permission(self, request, view):
        if request.method in ("PUT", "PATCH"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.change_droitadministration")
            )
        return True


class CanDeleteDroitAdministration(permissions.BasePermission):
    """Suppression (DELETE) : is_staff ou permission delete_droitadministration."""
    def has_permission(self, request, view):
        if request.method == "DELETE":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.delete_droitadministration")
            )
        return True


# --- Annonce ---
class CanViewAnnonce(permissions.BasePermission):
    """Lecture (GET) : is_staff ou permission view_annonce."""
    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.view_annonce")
            )
        return True


class CanCreateAnnonce(permissions.BasePermission):
    """Création (POST) : is_staff ou permission add_annonce."""
    def has_permission(self, request, view):
        if request.method == "POST":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.add_annonce")
            )
        return True


class CanUpdateAnnonce(permissions.BasePermission):
    """Modification (PUT, PATCH) : is_staff ou permission change_annonce."""
    def has_permission(self, request, view):
        if request.method in ("PUT", "PATCH"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.change_annonce")
            )
        return True


class CanDeleteAnnonce(permissions.BasePermission):
    """Suppression (DELETE) : is_staff ou permission delete_annonce."""
    def has_permission(self, request, view):
        if request.method == "DELETE":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.delete_annonce")
            )
        return True


# --- LectureAnnonce ---
class CanViewLectureAnnonce(permissions.BasePermission):
    """Lecture (GET) : is_staff ou permission view_lectureannonce."""
    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.view_lectureannonce")
            )
        return True


class CanCreateLectureAnnonce(permissions.BasePermission):
    """Création (POST) : is_staff ou permission add_lectureannonce."""
    def has_permission(self, request, view):
        if request.method == "POST":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.add_lectureannonce")
            )
        return True


class CanUpdateLectureAnnonce(permissions.BasePermission):
    """Modification (PUT, PATCH) : is_staff ou permission change_lectureannonce."""
    def has_permission(self, request, view):
        if request.method in ("PUT", "PATCH"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.change_lectureannonce")
            )
        return True


class CanDeleteLectureAnnonce(permissions.BasePermission):
    """Suppression (DELETE) : is_staff ou permission delete_lectureannonce."""
    def has_permission(self, request, view):
        if request.method == "DELETE":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.delete_lectureannonce")
            )
        return True


# --- EmploiDuTemps ---
class CanViewEmploiDuTemps(permissions.BasePermission):
    """Lecture (GET) : is_staff ou permission view_emploidutemps."""
    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.view_emploidutemps")
            )
        return True


class CanCreateEmploiDuTemps(permissions.BasePermission):
    """Création (POST) : is_staff ou permission add_emploidutemps."""
    def has_permission(self, request, view):
        if request.method == "POST":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.add_emploidutemps")
            )
        return True


class CanUpdateEmploiDuTemps(permissions.BasePermission):
    """Modification (PUT, PATCH) : is_staff ou permission change_emploidutemps."""
    def has_permission(self, request, view):
        if request.method in ("PUT", "PATCH"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.change_emploidutemps")
            )
        return True


class CanDeleteEmploiDuTemps(permissions.BasePermission):
    """Suppression (DELETE) : is_staff ou permission delete_emploidutemps."""
    def has_permission(self, request, view):
        if request.method == "DELETE":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.delete_emploidutemps")
            )
        return True


# --- Evenement ---
class CanViewEvenement(permissions.BasePermission):
    """Lecture (GET) : is_staff ou permission view_evenement."""
    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.view_evenement")
            )
        return True


class CanCreateEvenement(permissions.BasePermission):
    """Création (POST) : is_staff ou permission add_evenement."""
    def has_permission(self, request, view):
        if request.method == "POST":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.add_evenement")
            )
        return True


class CanUpdateEvenement(permissions.BasePermission):
    """Modification (PUT, PATCH) : is_staff ou permission change_evenement."""
    def has_permission(self, request, view):
        if request.method in ("PUT", "PATCH"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.change_evenement")
            )
        return True


class CanDeleteEvenement(permissions.BasePermission):
    """Suppression (DELETE) : is_staff ou permission delete_evenement."""
    def has_permission(self, request, view):
        if request.method == "DELETE":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.delete_evenement")
            )
        return True


# --- Categorie ---
class CanViewCategorie(permissions.BasePermission):
    """Lecture (GET) : is_staff ou permission view_categorie."""
    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.view_categorie")
            )
        return True


class CanCreateCategorie(permissions.BasePermission):
    """Création (POST) : is_staff ou permission add_categorie."""
    def has_permission(self, request, view):
        if request.method == "POST":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.add_categorie")
            )
        return True


class CanUpdateCategorie(permissions.BasePermission):
    """Modification (PUT, PATCH) : is_staff ou permission change_categorie."""
    def has_permission(self, request, view):
        if request.method in ("PUT", "PATCH"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.change_categorie")
            )
        return True


class CanDeleteCategorie(permissions.BasePermission):
    """Suppression (DELETE) : is_staff ou permission delete_categorie."""
    def has_permission(self, request, view):
        if request.method == "DELETE":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.delete_categorie")
            )
        return True


# --- Tag ---
class CanViewTag(permissions.BasePermission):
    """Lecture (GET) : is_staff ou permission view_tag."""
    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.view_tag")
            )
        return True


class CanCreateTag(permissions.BasePermission):
    """Création (POST) : is_staff ou permission add_tag."""
    def has_permission(self, request, view):
        if request.method == "POST":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.add_tag")
            )
        return True


class CanUpdateTag(permissions.BasePermission):
    """Modification (PUT, PATCH) : is_staff ou permission change_tag."""
    def has_permission(self, request, view):
        if request.method in ("PUT", "PATCH"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.change_tag")
            )
        return True


class CanDeleteTag(permissions.BasePermission):
    """Suppression (DELETE) : is_staff ou permission delete_tag."""
    def has_permission(self, request, view):
        if request.method == "DELETE":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.delete_tag")
            )
        return True


# --- AffectationEnseignant ---
class CanViewAffectationEnseignant(permissions.BasePermission):
    """Lecture (GET) : is_staff ou permission view_affectationenseignant."""
    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.view_affectationenseignant")
            )
        return True


class CanCreateAffectationEnseignant(permissions.BasePermission):
    """Création (POST) : is_staff ou permission add_affectationenseignant."""
    def has_permission(self, request, view):
        if request.method == "POST":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.add_affectationenseignant")
            )
        return True


class CanUpdateAffectationEnseignant(permissions.BasePermission):
    """Modification (PUT, PATCH) : is_staff ou permission change_affectationenseignant."""
    def has_permission(self, request, view):
        if request.method in ("PUT", "PATCH"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.change_affectationenseignant")
            )
        return True


class CanDeleteAffectationEnseignant(permissions.BasePermission):
    """Suppression (DELETE) : is_staff ou permission delete_affectationenseignant."""
    def has_permission(self, request, view):
        if request.method == "DELETE":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.delete_affectationenseignant")
            )
        return True


# --- Ressource ---
class CanViewRessource(permissions.BasePermission):
    """Lecture (GET) : is_staff ou permission view_ressource."""
    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.view_ressource")
            )
        return True


class CanCreateRessource(permissions.BasePermission):
    """Création (POST) : is_staff ou permission add_ressource."""
    def has_permission(self, request, view):
        if request.method == "POST":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.add_ressource")
            )
        return True


class CanUpdateRessource(permissions.BasePermission):
    """Modification (PUT, PATCH) : is_staff ou permission change_ressource."""
    def has_permission(self, request, view):
        if request.method in ("PUT", "PATCH"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.change_ressource")
            )
        return True


class CanDeleteRessource(permissions.BasePermission):
    """Suppression (DELETE) : is_staff ou permission delete_ressource."""
    def has_permission(self, request, view):
        if request.method == "DELETE":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.delete_ressource")
            )
        return True


# --- ConsultationRessource ---
class CanViewConsultationRessource(permissions.BasePermission):
    """Lecture (GET) : is_staff ou permission view_consultationressource."""
    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.view_consultationressource")
            )
        return True


class CanCreateConsultationRessource(permissions.BasePermission):
    """Création (POST) : is_staff ou permission add_consultationressource."""
    def has_permission(self, request, view):
        if request.method == "POST":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.add_consultationressource")
            )
        return True


class CanUpdateConsultationRessource(permissions.BasePermission):
    """Modification (PUT, PATCH) : is_staff ou permission change_consultationressource."""
    def has_permission(self, request, view):
        if request.method in ("PUT", "PATCH"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.change_consultationressource")
            )
        return True


class CanDeleteConsultationRessource(permissions.BasePermission):
    """Suppression (DELETE) : is_staff ou permission delete_consultationressource."""
    def has_permission(self, request, view):
        if request.method == "DELETE":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.delete_consultationressource")
            )
        return True


# --- Exemplaire ---
class CanViewExemplaire(permissions.BasePermission):
    """Lecture (GET) : is_staff ou permission view_exemplaire."""
    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.view_exemplaire")
            )
        return True


class CanCreateExemplaire(permissions.BasePermission):
    """Création (POST) : is_staff ou permission add_exemplaire."""
    def has_permission(self, request, view):
        if request.method == "POST":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.add_exemplaire")
            )
        return True


class CanUpdateExemplaire(permissions.BasePermission):
    """Modification (PUT, PATCH) : is_staff ou permission change_exemplaire."""
    def has_permission(self, request, view):
        if request.method in ("PUT", "PATCH"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.change_exemplaire")
            )
        return True


class CanDeleteExemplaire(permissions.BasePermission):
    """Suppression (DELETE) : is_staff ou permission delete_exemplaire."""
    def has_permission(self, request, view):
        if request.method == "DELETE":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.delete_exemplaire")
            )
        return True


# --- Emprunt ---
class CanViewEmprunt(permissions.BasePermission):
    """Lecture (GET) : is_staff ou permission view_emprunt."""
    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.view_emprunt")
            )
        return True


class CanCreateEmprunt(permissions.BasePermission):
    """Création (POST) : is_staff ou permission add_emprunt."""
    def has_permission(self, request, view):
        if request.method == "POST":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.add_emprunt")
            )
        return True


class CanUpdateEmprunt(permissions.BasePermission):
    """Modification (PUT, PATCH) : is_staff ou permission change_emprunt."""
    def has_permission(self, request, view):
        if request.method in ("PUT", "PATCH"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.change_emprunt")
            )
        return True


class CanDeleteEmprunt(permissions.BasePermission):
    """Suppression (DELETE) : is_staff ou permission delete_emprunt."""
    def has_permission(self, request, view):
        if request.method == "DELETE":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.delete_emprunt")
            )
        return True


# --- Reservation ---
class CanViewReservation(permissions.BasePermission):
    """Lecture (GET) : is_staff ou permission view_reservation."""
    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.view_reservation")
            )
        return True


class CanCreateReservation(permissions.BasePermission):
    """Création (POST) : is_staff ou permission add_reservation."""
    def has_permission(self, request, view):
        if request.method == "POST":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.add_reservation")
            )
        return True


class CanUpdateReservation(permissions.BasePermission):
    """Modification (PUT, PATCH) : is_staff ou permission change_reservation."""
    def has_permission(self, request, view):
        if request.method in ("PUT", "PATCH"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.change_reservation")
            )
        return True


class CanDeleteReservation(permissions.BasePermission):
    """Suppression (DELETE) : is_staff ou permission delete_reservation."""
    def has_permission(self, request, view):
        if request.method == "DELETE":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.delete_reservation")
            )
        return True


# --- Message ---
class CanViewMessage(permissions.BasePermission):
    """Lecture (GET) : is_staff ou permission view_message."""
    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.view_message")
            )
        return True


class CanCreateMessage(permissions.BasePermission):
    """Création (POST) : is_staff ou permission add_message."""
    def has_permission(self, request, view):
        if request.method == "POST":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.add_message")
            )
        return True


class CanUpdateMessage(permissions.BasePermission):
    """Modification (PUT, PATCH) : is_staff ou permission change_message."""
    def has_permission(self, request, view):
        if request.method in ("PUT", "PATCH"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.change_message")
            )
        return True


class CanDeleteMessage(permissions.BasePermission):
    """Suppression (DELETE) : is_staff ou permission delete_message."""
    def has_permission(self, request, view):
        if request.method == "DELETE":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.delete_message")
            )
        return True


# --- Forum ---
class CanViewForum(permissions.BasePermission):
    """Lecture (GET) : is_staff ou permission view_forum."""
    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.view_forum")
            )
        return True


class CanCreateForum(permissions.BasePermission):
    """Création (POST) : is_staff ou permission add_forum."""
    def has_permission(self, request, view):
        if request.method == "POST":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.add_forum")
            )
        return True


class CanUpdateForum(permissions.BasePermission):
    """Modification (PUT, PATCH) : is_staff ou permission change_forum."""
    def has_permission(self, request, view):
        if request.method in ("PUT", "PATCH"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.change_forum")
            )
        return True


class CanDeleteForum(permissions.BasePermission):
    """Suppression (DELETE) : is_staff ou permission delete_forum."""
    def has_permission(self, request, view):
        if request.method == "DELETE":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.delete_forum")
            )
        return True


# --- Sujet ---
class CanViewSujet(permissions.BasePermission):
    """Lecture (GET) : is_staff ou permission view_sujet."""
    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.view_sujet")
            )
        return True


class CanCreateSujet(permissions.BasePermission):
    """Création (POST) : is_staff ou permission add_sujet."""
    def has_permission(self, request, view):
        if request.method == "POST":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.add_sujet")
            )
        return True


class CanUpdateSujet(permissions.BasePermission):
    """Modification (PUT, PATCH) : is_staff ou permission change_sujet."""
    def has_permission(self, request, view):
        if request.method in ("PUT", "PATCH"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.change_sujet")
            )
        return True


class CanDeleteSujet(permissions.BasePermission):
    """Suppression (DELETE) : is_staff ou permission delete_sujet."""
    def has_permission(self, request, view):
        if request.method == "DELETE":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.delete_sujet")
            )
        return True


# --- Reponse ---
class CanViewReponse(permissions.BasePermission):
    """Lecture (GET) : is_staff ou permission view_reponse."""
    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.view_reponse")
            )
        return True


class CanCreateReponse(permissions.BasePermission):
    """Création (POST) : is_staff ou permission add_reponse."""
    def has_permission(self, request, view):
        if request.method == "POST":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.add_reponse")
            )
        return True


class CanUpdateReponse(permissions.BasePermission):
    """Modification (PUT, PATCH) : is_staff ou permission change_reponse."""
    def has_permission(self, request, view):
        if request.method in ("PUT", "PATCH"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.change_reponse")
            )
        return True


class CanDeleteReponse(permissions.BasePermission):
    """Suppression (DELETE) : is_staff ou permission delete_reponse."""
    def has_permission(self, request, view):
        if request.method == "DELETE":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.delete_reponse")
            )
        return True


# --- ReactionReponse ---
class CanViewReactionReponse(permissions.BasePermission):
    """Lecture (GET) : is_staff ou permission view_reactionreponse."""
    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.view_reactionreponse")
            )
        return True


class CanCreateReactionReponse(permissions.BasePermission):
    """Création (POST) : is_staff ou permission add_reactionreponse."""
    def has_permission(self, request, view):
        if request.method == "POST":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.add_reactionreponse")
            )
        return True


class CanUpdateReactionReponse(permissions.BasePermission):
    """Modification (PUT, PATCH) : is_staff ou permission change_reactionreponse."""
    def has_permission(self, request, view):
        if request.method in ("PUT", "PATCH"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.change_reactionreponse")
            )
        return True


class CanDeleteReactionReponse(permissions.BasePermission):
    """Suppression (DELETE) : is_staff ou permission delete_reactionreponse."""
    def has_permission(self, request, view):
        if request.method == "DELETE":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("administration.delete_reactionreponse")
            )
        return True

