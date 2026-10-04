"""
Lecture des documents par l'etudiant : portee, filtres et telechargement.

Jusqu'ici l'espace etudiant lisait /api/etablissement/ressources/, l'endpoint
d'administration. Deux consequences :

- la liste renvoyait toutes les ressources de l'etablissement, sans tri par
  ce qui concerne l'etudiant ;
- les cles etrangeres partaient en cascade d'ids, et le front affichait donc
  « Matiere N°5 » dans ses filtres.

Ce service applique la regle de visibilite et renvoie des libelles. Les
filtres restent cote serveur : la liste de l'etudiant peutvite depasser ce
qu'un navigateur doit ramener en memoire.
"""
from pathlib import Path

from django.conf import settings
from django.db.models import Q

from app.administration.models import Ressource
from app.core.exceptions import NotFoundError


# Champs sur lesquels le filtre `search` porte. Le titre d'abord parce que
# c'est ce que l'etudiant tape ; l'auteur et la matiere ensuite.
CHAMPS_RECHERCHE = ("titre", "auteur", "matiere__libelle", "description")


class DocumentEtudiantService:
    """Ce qu'un etudiant a le droit de voir, et comment il telecharge."""

    def __init__(self, etudiant):
        self.etudiant = etudiant

    def _classe(self):
        return self.etudiant.classe if self.etudiant else None

    def _auth_user_id(self):
        user = getattr(self.etudiant, "user", None)
        return getattr(user, "id", None)

    def visibles(self):
        """
        Ressources accessibles a cet etudiant.

        Trois portes, dans cet ordre d'importance :

        1. ce que l'etudiant a lui-meme depose, toujours visible, public ou
           non : sinon un document rendu par l'etudiant disparait de son
           propre espace ;
        2. ce qui est publie, donc ouvert a tous ;
        3. ce qui est rattache a sa classe, meme non publie.

        Ce qui n'est ni publie ni rattache a une classe n'est visible que du
        staff, pas via cet endpoint.
        """
        conditions = Q(is_public=True)
        auth_id = self._auth_user_id()
        if auth_id:
            conditions |= Q(uploaded_by__id=auth_id)
        classe = self._classe()
        if classe:
            conditions |= Q(classe=classe)
        return (
            Ressource.objects.filter(conditions)
            .select_related("matiere", "classe", "niveau", "filiere", "annee_academique")
            .order_by("-created_at")
        )

    def liste(self, filtres: dict | None = None):
        """Applique les filtres de requete sur la portee visible."""
        filtres = filtres or {}
        qs = self.visibles()

        def entier(nom):
            brut = filtres.get(nom)
            if brut in (None, "", "0"):
                return None
            try:
                return int(brut)
            except (TypeError, ValueError):
                return None

        if entier("classe_id"):
            qs = qs.filter(classe_id=entier("classe_id"))
        if entier("matiere_id"):
            qs = qs.filter(matiere_id=entier("matiere_id"))
        if entier("niveau_id"):
            qs = qs.filter(niveau_id=entier("niveau_id"))
        if entier("filiere_id"):
            qs = qs.filter(filiere_id=entier("filiere_id"))
        if entier("annee_academique_id"):
            qs = qs.filter(annee_academique_id=entier("annee_academique_id"))

        type_ressource = (filtres.get("type_ressource") or "").strip()
        if type_ressource:
            qs = qs.filter(type_ressource=type_ressource)

        recherche = (filtres.get("search") or "").strip()
        if recherche:
            condition = Q()
            for champ in CHAMPS_RECHERCHE:
                condition |= Q(**{f"{champ}__icontains": recherche})
            qs = qs.filter(condition)

        return qs

    def choisir_filtres(self, requete):
        """
        Transforme une QueryDict (?classe_id=3&classe_id=4) en le dict de
        cles simples qu'attend liste(). Seules les premieres valeurs comptent :
        une liste par cle ferait ecraser le filtre precedent.
        """
        return {cle: requete.get(cle) for cle in FILTRES_ACCEPTES}


FILTRES_ACCEPTES = (
    "classe_id",
    "matiere_id",
    "niveau_id",
    "filiere_id",
    "annee_academique_id",
    "type_ressource",
    "search",
)


def chemin_absolu(ressource: Ressource) -> Path:
    """
    Chemin sur disque du fichier d'une ressource.

    Le chemin stocke est relatif a MEDIA_ROOT et a ete ecrit par
    app.core.documents, donc il ne contient pas de « .. ». On resout quand meme
    et on refuse si le resultat sort de MEDIA_ROOT : une ligne de base
    rstalee vers un ancien serveur ne doit pas pouvoir faire lire /etc/passwd.
    """
    if not ressource.fichier:
        raise NotFoundError("Ce document n'a pas de fichier joint.")
    racine = Path(settings.MEDIA_ROOT).resolve()
    chemin = (racine / ressource.fichier).resolve()
    if racine not in chemin.parents:
        raise NotFoundError("Fichier introuvable.")
    if not chemin.is_file():
        raise NotFoundError("Fichier introuvable.")
    return chemin