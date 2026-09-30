"""Service métier : permissions d'upload étudiant + upload de ressources."""
from django.db import transaction

from app.administration.models import Ressource
from app.core.documents import enregistrer_fichier
from app.core.exceptions import NotFoundError, ValidationError
from app.espace_student.models import (
    TYPES_UPLOAD_VALIDES,
    PermissionUploadEtudiant,
)
from app.espace_student.utils import (
    ensure_etudiant_for_auth_user,
    get_auth_user_for_etudiant,
    get_etudiant_for_auth_user,
)

# Plafond historique de l'upload etudiant. Le module partage porte la meme
# valeur par defaut ; on la redefinit ici pour qu'une evolution du plafond
# general ne change pas le contrat deja lu par les permissions existantes.
MAX_UPLOAD_BYTES = 20 * 1024 * 1024  # 20 Mo
ALLOWED_EXTENSIONS = {
    ".pdf", ".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx",
    ".png", ".jpg", ".jpeg", ".gif", ".txt", ".zip",
}


class PermissionUploadService:
    def list_all(self):
        return (
            PermissionUploadEtudiant.objects.select_related("etudiant", "accorde_par")
            .all()
        )

    def get_or_raise(self, pk: int) -> PermissionUploadEtudiant:
        try:
            return PermissionUploadEtudiant.objects.select_related("etudiant").get(pk=pk)
        except PermissionUploadEtudiant.DoesNotExist:
            raise NotFoundError("Permission introuvable.")

    def get_for_auth_user(self, auth_user) -> PermissionUploadEtudiant | None:
        etudiant = get_etudiant_for_auth_user(auth_user)
        if not etudiant:
            return None
        return (
            PermissionUploadEtudiant.objects.filter(etudiant=etudiant)
            .select_related("etudiant")
            .first()
        )

    def _normalize_types(self, types) -> list[str]:
        if not isinstance(types, list) or not types:
            raise ValidationError("types_autorises doit être une liste non vide.")
        cleaned = []
        for t in types:
            t = str(t).strip()
            if t not in TYPES_UPLOAD_VALIDES:
                raise ValidationError(
                    f"Type invalide : {t}. Autorisés : {', '.join(sorted(TYPES_UPLOAD_VALIDES))}"
                )
            if t not in cleaned:
                cleaned.append(t)
        return cleaned

    @transaction.atomic
    def grant(
        self,
        *,
        auth_user_id: int,
        types_autorises: list,
        is_active: bool = True,
        note: str = "",
        accorde_par=None,
    ) -> PermissionUploadEtudiant:
        from django.contrib.auth import get_user_model

        AuthUser = get_user_model()
        try:
            auth_user = AuthUser.objects.get(pk=auth_user_id)
        except AuthUser.DoesNotExist:
            raise NotFoundError("Étudiant introuvable.")
        if auth_user.is_staff or auth_user.is_superuser:
            raise ValidationError("Seuls les comptes étudiants peuvent recevoir cette permission.")

        types = self._normalize_types(types_autorises)
        etudiant = ensure_etudiant_for_auth_user(auth_user)
        perm, _ = PermissionUploadEtudiant.objects.update_or_create(
            etudiant=etudiant,
            defaults={
                "types_autorises": types,
                "is_active": bool(is_active),
                "note": (note or "")[:255],
                "accorde_par": accorde_par,
            },
        )
        return perm

    def update(self, pk: int, **data) -> PermissionUploadEtudiant:
        perm = self.get_or_raise(pk)
        if "types_autorises" in data and data["types_autorises"] is not None:
            perm.types_autorises = self._normalize_types(data["types_autorises"])
        if "is_active" in data and data["is_active"] is not None:
            perm.is_active = bool(data["is_active"])
        if "note" in data and data["note"] is not None:
            perm.note = str(data["note"])[:255]
        perm.save()
        return perm

    def revoke(self, pk: int) -> None:
        perm = self.get_or_raise(pk)
        perm.delete()

    def serialize(self, perm: PermissionUploadEtudiant) -> dict:
        auth_user = get_auth_user_for_etudiant(perm.etudiant)
        return {
            "id": perm.id,
            "etudiant_id": perm.etudiant_id,
            "user_id": auth_user.id if auth_user else perm.etudiant.user_id,
            "email": auth_user.email if auth_user else "",
            "first_name": (auth_user.first_name if auth_user else "") or "",
            "last_name": (auth_user.last_name if auth_user else "") or "",
            "matricule": perm.etudiant.matricule,
            "types_autorises": perm.types_normes(),
            "is_active": perm.is_active,
            "note": perm.note or "",
            "accorde_par_id": perm.accorde_par_id,
            "created_at": perm.created_at.isoformat() if perm.created_at else None,
            "updated_at": perm.updated_at.isoformat() if perm.updated_at else None,
        }

    @transaction.atomic
    def upload_ressource(
        self,
        *,
        auth_user,
        titre: str,
        type_ressource: str,
        uploaded_file,
        description: str = "",
        matiere_id=None,
    ) -> Ressource:
        perm = self.get_for_auth_user(auth_user)
        if not perm or not perm.is_active:
            raise ValidationError("Vous n'avez pas la permission d'uploader des fichiers.")
        type_ressource = str(type_ressource or "").strip()
        if not perm.peut_uploader_type(type_ressource):
            raise ValidationError(
                f"Type non autorisé. Types permis : {', '.join(perm.types_normes())}"
            )
        titre = (titre or "").strip()
        if not titre:
            raise ValidationError("Le titre est requis.")

        # L'ecriture sur disque est partagee avec l'espace admin : memes
        # extensions, meme plafond, meme nomuuid. Voir app/core/documents.py.
        relative, size, ext = enregistrer_fichier(
            uploaded_file,
            sous_dossier=f"uploads/etudiants/{auth_user.id}",
            taille_max=MAX_UPLOAD_BYTES,
            extensions=ALLOWED_EXTENSIONS,
        )

        # uploaded_by = app_admin.User aligné sur auth user id
        from app.admin.models import User as AdminUser

        admin_user, _ = AdminUser.objects.get_or_create(
            id=auth_user.id,
            defaults={"role": "user", "is_active": True},
        )

        matiere = None
        if matiere_id:
            from app.administration.models import Matiere
            matiere = Matiere.objects.filter(pk=matiere_id).first()

        return Ressource.objects.create(
            titre=titre[:300],
            description=(description or "")[:5000] or None,
            type_ressource=type_ressource[:15],
            matiere=matiere,
            fichier=relative,
            taille_fichier=size,
            format_fichier=ext.lstrip(".")[:10] or None,
            is_public=False,  # un devoir rendu n'est pas public, cf. DocumentEtudiantService
            uploaded_by=admin_user,
        )
