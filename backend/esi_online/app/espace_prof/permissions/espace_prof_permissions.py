from rest_framework import permissions


# --- Enseignant ---
class CanViewEnseignant(permissions.BasePermission):
    """Lecture (GET) : is_staff ou permission view_enseignant."""
    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("espace_prof.view_enseignant")
            )
        return True


class CanCreateEnseignant(permissions.BasePermission):
    """Création (POST) : is_staff ou permission add_enseignant."""
    def has_permission(self, request, view):
        if request.method == "POST":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("espace_prof.add_enseignant")
            )
        return True


class CanUpdateEnseignant(permissions.BasePermission):
    """Modification (PUT, PATCH) : is_staff ou permission change_enseignant."""
    def has_permission(self, request, view):
        if request.method in ("PUT", "PATCH"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("espace_prof.change_enseignant")
            )
        return True


class CanDeleteEnseignant(permissions.BasePermission):
    """Suppression (DELETE) : is_staff ou permission delete_enseignant."""
    def has_permission(self, request, view):
        if request.method == "DELETE":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("espace_prof.delete_enseignant")
            )
        return True


# --- Cours ---
class CanViewCours(permissions.BasePermission):
    """Lecture (GET) : is_staff ou permission view_cours."""
    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("espace_prof.view_cours")
            )
        return True


class CanCreateCours(permissions.BasePermission):
    """Création (POST) : is_staff ou permission add_cours."""
    def has_permission(self, request, view):
        if request.method == "POST":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("espace_prof.add_cours")
            )
        return True


class CanUpdateCours(permissions.BasePermission):
    """Modification (PUT, PATCH) : is_staff ou permission change_cours."""
    def has_permission(self, request, view):
        if request.method in ("PUT", "PATCH"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("espace_prof.change_cours")
            )
        return True


class CanDeleteCours(permissions.BasePermission):
    """Suppression (DELETE) : is_staff ou permission delete_cours."""
    def has_permission(self, request, view):
        if request.method == "DELETE":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("espace_prof.delete_cours")
            )
        return True


# --- Chapitre ---
class CanViewChapitre(permissions.BasePermission):
    """Lecture (GET) : is_staff ou permission view_chapitre."""
    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("espace_prof.view_chapitre")
            )
        return True


class CanCreateChapitre(permissions.BasePermission):
    """Création (POST) : is_staff ou permission add_chapitre."""
    def has_permission(self, request, view):
        if request.method == "POST":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("espace_prof.add_chapitre")
            )
        return True


class CanUpdateChapitre(permissions.BasePermission):
    """Modification (PUT, PATCH) : is_staff ou permission change_chapitre."""
    def has_permission(self, request, view):
        if request.method in ("PUT", "PATCH"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("espace_prof.change_chapitre")
            )
        return True


class CanDeleteChapitre(permissions.BasePermission):
    """Suppression (DELETE) : is_staff ou permission delete_chapitre."""
    def has_permission(self, request, view):
        if request.method == "DELETE":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("espace_prof.delete_chapitre")
            )
        return True


# --- RessourceCours ---
class CanViewRessourceCours(permissions.BasePermission):
    """Lecture (GET) : is_staff ou permission view_ressourcecours."""
    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("espace_prof.view_ressourcecours")
            )
        return True


class CanCreateRessourceCours(permissions.BasePermission):
    """Création (POST) : is_staff ou permission add_ressourcecours."""
    def has_permission(self, request, view):
        if request.method == "POST":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("espace_prof.add_ressourcecours")
            )
        return True


class CanUpdateRessourceCours(permissions.BasePermission):
    """Modification (PUT, PATCH) : is_staff ou permission change_ressourcecours."""
    def has_permission(self, request, view):
        if request.method in ("PUT", "PATCH"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("espace_prof.change_ressourcecours")
            )
        return True


class CanDeleteRessourceCours(permissions.BasePermission):
    """Suppression (DELETE) : is_staff ou permission delete_ressourcecours."""
    def has_permission(self, request, view):
        if request.method == "DELETE":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("espace_prof.delete_ressourcecours")
            )
        return True


# --- Exercice ---
class CanViewExercice(permissions.BasePermission):
    """Lecture (GET) : is_staff ou permission view_exercice."""
    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("espace_prof.view_exercice")
            )
        return True


class CanCreateExercice(permissions.BasePermission):
    """Création (POST) : is_staff ou permission add_exercice."""
    def has_permission(self, request, view):
        if request.method == "POST":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("espace_prof.add_exercice")
            )
        return True


class CanUpdateExercice(permissions.BasePermission):
    """Modification (PUT, PATCH) : is_staff ou permission change_exercice."""
    def has_permission(self, request, view):
        if request.method in ("PUT", "PATCH"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("espace_prof.change_exercice")
            )
        return True


class CanDeleteExercice(permissions.BasePermission):
    """Suppression (DELETE) : is_staff ou permission delete_exercice."""
    def has_permission(self, request, view):
        if request.method == "DELETE":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("espace_prof.delete_exercice")
            )
        return True


# --- TP ---
class CanViewTP(permissions.BasePermission):
    """Lecture (GET) : is_staff ou permission view_tp."""
    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("espace_prof.view_tp")
            )
        return True


class CanCreateTP(permissions.BasePermission):
    """Création (POST) : is_staff ou permission add_tp."""
    def has_permission(self, request, view):
        if request.method == "POST":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("espace_prof.add_tp")
            )
        return True


class CanUpdateTP(permissions.BasePermission):
    """Modification (PUT, PATCH) : is_staff ou permission change_tp."""
    def has_permission(self, request, view):
        if request.method in ("PUT", "PATCH"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("espace_prof.change_tp")
            )
        return True


class CanDeleteTP(permissions.BasePermission):
    """Suppression (DELETE) : is_staff ou permission delete_tp."""
    def has_permission(self, request, view):
        if request.method == "DELETE":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("espace_prof.delete_tp")
            )
        return True


# --- FichierSupportTP ---
class CanViewFichierSupportTP(permissions.BasePermission):
    """Lecture (GET) : is_staff ou permission view_fichiersupporttp."""
    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("espace_prof.view_fichiersupporttp")
            )
        return True


class CanCreateFichierSupportTP(permissions.BasePermission):
    """Création (POST) : is_staff ou permission add_fichiersupporttp."""
    def has_permission(self, request, view):
        if request.method == "POST":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("espace_prof.add_fichiersupporttp")
            )
        return True


class CanUpdateFichierSupportTP(permissions.BasePermission):
    """Modification (PUT, PATCH) : is_staff ou permission change_fichiersupporttp."""
    def has_permission(self, request, view):
        if request.method in ("PUT", "PATCH"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("espace_prof.change_fichiersupporttp")
            )
        return True


class CanDeleteFichierSupportTP(permissions.BasePermission):
    """Suppression (DELETE) : is_staff ou permission delete_fichiersupporttp."""
    def has_permission(self, request, view):
        if request.method == "DELETE":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("espace_prof.delete_fichiersupporttp")
            )
        return True


# --- QCM ---
class CanViewQCM(permissions.BasePermission):
    """Lecture (GET) : is_staff ou permission view_qcm."""
    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("espace_prof.view_qcm")
            )
        return True


class CanCreateQCM(permissions.BasePermission):
    """Création (POST) : is_staff ou permission add_qcm."""
    def has_permission(self, request, view):
        if request.method == "POST":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("espace_prof.add_qcm")
            )
        return True


class CanUpdateQCM(permissions.BasePermission):
    """Modification (PUT, PATCH) : is_staff ou permission change_qcm."""
    def has_permission(self, request, view):
        if request.method in ("PUT", "PATCH"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("espace_prof.change_qcm")
            )
        return True


class CanDeleteQCM(permissions.BasePermission):
    """Suppression (DELETE) : is_staff ou permission delete_qcm."""
    def has_permission(self, request, view):
        if request.method == "DELETE":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("espace_prof.delete_qcm")
            )
        return True


# --- QuestionQCM ---
class CanViewQuestionQCM(permissions.BasePermission):
    """Lecture (GET) : is_staff ou permission view_questionqcm."""
    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("espace_prof.view_questionqcm")
            )
        return True


class CanCreateQuestionQCM(permissions.BasePermission):
    """Création (POST) : is_staff ou permission add_questionqcm."""
    def has_permission(self, request, view):
        if request.method == "POST":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("espace_prof.add_questionqcm")
            )
        return True


class CanUpdateQuestionQCM(permissions.BasePermission):
    """Modification (PUT, PATCH) : is_staff ou permission change_questionqcm."""
    def has_permission(self, request, view):
        if request.method in ("PUT", "PATCH"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("espace_prof.change_questionqcm")
            )
        return True


class CanDeleteQuestionQCM(permissions.BasePermission):
    """Suppression (DELETE) : is_staff ou permission delete_questionqcm."""
    def has_permission(self, request, view):
        if request.method == "DELETE":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("espace_prof.delete_questionqcm")
            )
        return True


# --- ReponseQCM ---
class CanViewReponseQCM(permissions.BasePermission):
    """Lecture (GET) : is_staff ou permission view_reponseqcm."""
    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("espace_prof.view_reponseqcm")
            )
        return True


class CanCreateReponseQCM(permissions.BasePermission):
    """Création (POST) : is_staff ou permission add_reponseqcm."""
    def has_permission(self, request, view):
        if request.method == "POST":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("espace_prof.add_reponseqcm")
            )
        return True


class CanUpdateReponseQCM(permissions.BasePermission):
    """Modification (PUT, PATCH) : is_staff ou permission change_reponseqcm."""
    def has_permission(self, request, view):
        if request.method in ("PUT", "PATCH"):
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("espace_prof.change_reponseqcm")
            )
        return True


class CanDeleteReponseQCM(permissions.BasePermission):
    """Suppression (DELETE) : is_staff ou permission delete_reponseqcm."""
    def has_permission(self, request, view):
        if request.method == "DELETE":
            return request.user.is_authenticated and (
                request.user.is_staff or request.user.has_perm("espace_prof.delete_reponseqcm")
            )
        return True

