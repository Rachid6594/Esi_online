"""
Depot de documents par l'administration.

Distinct du CRUD JSON sur /ressources/ : la creation d'une ressource y passe
par un objet sérialise, donc par un chemin de fichier saisi a la main. Cet
endpoint accepte du multipart et ecrit le fichier sur le disque.

Separer les deux evite de rendre le CRUD generique dependant d'un parseur de
fichiers : tous les autres CRUD de l'application restent en JSON.
"""
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.decorators import (
    api_view,
    parser_classes,
    permission_classes,
)
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response

from app.administration.api.serializers import RessourceSerializer
from app.administration.permissions.administration_permissions import (
    CanCreateRessource,
)
from app.administration.services.document_service import DocumentService
from app.core.documents import TYPES_DOCUMENT
from app.core.exceptions import NotFoundError, ValidationError


@extend_schema(
    tags=["Espace Eleve API"],
    summary="Deposer un document",
    request={"multipart/form-data": {"type": "object"}},
    responses={201: RessourceSerializer, 400: {"type": "object"}},
)
@api_view(["POST"])
@permission_classes([CanCreateRessource])
@parser_classes([MultiPartParser, FormParser])
def document_depot(request):
    """
    Depose un document (devoir, TD, TP, rapport...) et le rattache a sa classe,
    sa matiere, son annee et sa categorie.

    Le fichier est ecrit sous MEDIA_ROOT/uploads/admin/ avec un nom uuid, et
    Ressource.fichier conserve le chemin relatif.
    """
    # Tous les champs arrivent en chaine : un Select vide est "" et non None,
    # et "0" doit compter comme absent, pas comme une cle etrangere.
    matiere_id = _entier(request.data.get("matiere_id"))
    classe_id = _entier(request.data.get("classe_id"))
    filiere_id = _entier(request.data.get("filiere_id"))
    niveau_id = _entier(request.data.get("niveau_id"))
    annee_id = _entier(request.data.get("annee_academique_id"))
    categorie_id = _entier(request.data.get("categorie_id"))

    try:
        ressource = DocumentService().deposer_document(
            auth_user=request.user,
            titre=request.data.get("titre") or "",
            type_ressource=request.data.get("type_ressource") or "",
            uploaded_file=request.FILES.get("fichier") or request.FILES.get("file"),
            description=request.data.get("description") or "",
            lien=request.data.get("lien") or "",
            auteur=request.data.get("auteur") or "",
            matiere_id=matiere_id,
            classe_id=classe_id,
            filiere_id=filiere_id,
            niveau_id=niveau_id,
            annee_academique_id=annee_id,
            categorie_id=categorie_id,
            is_public=_booleen(request.data.get("is_public")),
        )
    except ValidationError as e:
        return Response({"detail": e.message}, status=status.HTTP_400_BAD_REQUEST)
    except NotFoundError as e:
        return Response({"detail": e.message}, status=status.HTTP_404_NOT_FOUND)

    return Response(
        RessourceSerializer(ressource).data, status=status.HTTP_201_CREATED
    )


@extend_schema(
    tags=["Espace Eleve API"],
    summary="Types de documents acceptes",
    responses={200: {"type": "array", "items": {"type": "object"}}},
)
@api_view(["GET"])
@permission_classes([CanCreateRessource])
def types_document(request):
    """
    Liste des types de documents acceptes par l'endpoint de depot.

    Le formulaire d'admin le lit au lieu d'ecrire sa propre liste : les deux
    cotes ne peuvent plus diverger.
    """
    return Response(
        [{"valeur": valeur, "libelle": libelle} for valeur, libelle in TYPES_DOCUMENT]
    )


def _entier(valeur):
    """None si vide ou "0" (la valeur des Select sans choix), sinon l'entier."""
    if valeur in (None, "", "0"):
        return None
    try:
        return int(valeur)
    except (TypeError, ValueError):
        return None


def _booleen(valeur):
    if isinstance(valeur, bool):
        return valeur
    return str(valeur).strip().lower() in ("1", "true", "on", "oui", "yes")
