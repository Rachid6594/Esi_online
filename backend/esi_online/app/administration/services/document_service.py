"""
Service de depot de documents par l'administration.

Complete RessourceService, qui ne fait que du CRUD. La creation d'une
ressource passait par un endpoint JSON et Ressource.fichier est un CharField :
un admin pouvait saisir un chemin, mais pas deposer un vrai fichier. Ce service
ecrit le fichier sur le disque puis enregistre la ligne qui le reference.

Difference avec l'espace etudiant : l'admin choisit le rattachement (classe,
matiere, annee, filiere, categorie) et la visibilite, et n'a pas besoin d'une
permission d'upload, puisque c'est sa fonction.
"""
from django.db import transaction

from app.administration.models import (
    AnneeAcademique,
    Categorie,
    Classe,
    Filiere,
    Matiere,
    Niveau,
    Ressource,
)
from app.core.documents import TYPES_DOCUMENT_VALIDES, enregistrer_fichier
from app.core.exceptions import NotFoundError, ValidationError

# Plafond plus large que celui de l'upload etudiant (20 Mo) : un cours ou un
# rapport de stage est un document lourd, un devoir envoye par un etudiant
# reste court. Les deux sont regles, pas devines.
TAILLE_MAX_DOCUMENT = 100 * 1024 * 1024  # 100 Mo


class DocumentService:
    """Depot et classement de documents par l'administration."""

    @transaction.atomic
    def deposer_document(
        self,
        *,
        auth_user,
        titre: str,
        type_ressource: str,
        uploaded_file=None,
        description: str = "",
        lien: str = "",
        auteur: str = "",
        matiere_id=None,
        classe_id=None,
        filiere_id=None,
        niveau_id=None,
        annee_academique_id=None,
        categorie_id=None,
        is_public: bool = True,
    ) -> Ressource:
        """
        Ecrit le fichier puis cree la Ressource qui le reference.

        Un document se designe par un fichier, par un lien, ou par les deux.
        Il en faut au moins un : une ressource sans fichier ni lien n'a rien a
        montrer a l'etudiant.
        """
        titre = (titre or "").strip()
        if not titre:
            raise ValidationError("Le titre est requis.")

        type_ressource = (type_ressource or "").strip()
        if type_ressource not in TYPES_DOCUMENT_VALIDES:
            raise ValidationError(
                f"Type de document inconnu : {type_ressource or '(vide)'}. "
                f"Autorisés : {', '.join(sorted(TYPES_DOCUMENT_VALIDES))}"
            )

        lien = (lien or "").strip()
        if uploaded_file is None and not lien:
            raise ValidationError("Il faut soit un fichier, soit un lien.")

        # Les cles etrangeres sont resolues avant d'ecrire le fichier : une
        # matiere inexistante doit renvoyer 404 sans laisser d'octet sur le
        # disque.
        matiere = _resoudre(Matiere, "Matière", matiere_id)
        classe = _resoudre(Classe, "Classe", classe_id)
        filiere = _resoudre(Filiere, "Filière", filiere_id)
        niveau = _resoudre(Niveau, "Niveau", niveau_id)
        annee = _resoudre(AnneeAcademique, "Année académique", annee_academique_id)
        categorie = _resoudre(Categorie, "Catégorie", categorie_id)

        chemin_relatif = None
        taille = None
        extension = None
        if uploaded_file is not None:
            chemin_relatif, taille, extension = enregistrer_fichier(
                uploaded_file,
                sous_dossier="uploads/admin",
                taille_max=TAILLE_MAX_DOCUMENT,
            )

        return Ressource.objects.create(
            titre=titre[:300],
            description=(description or "").strip()[:5000] or None,
            type_ressource=type_ressource[:15],
            fichier=chemin_relatif,
            lien=lien[:200] or None,
            taille_fichier=taille,
            format_fichier=(extension or "").lstrip(".")[:10] or None,
            auteur=(auteur or "").strip()[:200] or None,
            matiere=matiere,
            classe=classe,
            filiere=filiere,
            niveau=niveau,
            annee_academique=annee,
            categorie=categorie,
            is_public=bool(is_public),
            uploaded_by=_app_admin(auth_user),
        )


def _resoudre(model, libelle: str, pk):
    """Resout une cle etrangere : None si absente, 404 si elle n'existe pas."""
    if not pk:
        return None
    obj = model.objects.filter(pk=pk).first()
    if obj is None:
        raise NotFoundError(f"{libelle} #{pk} introuvable.")
    return obj


def _app_admin(auth_user):
    """Ligne app_admin.User alignee sur l'id du User d'authentification."""
    if auth_user is None or not getattr(auth_user, "is_authenticated", False):
        return None
    from app.admin.models import User as AdminUser

    admin_user, _ = AdminUser.objects.get_or_create(
        id=auth_user.id,
        defaults={"role": "admin", "is_active": True},
    )
    return admin_user
