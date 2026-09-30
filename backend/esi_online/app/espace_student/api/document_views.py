"""
Endpoints documents de l'espace etudiant.

Remplace la lecture directe de /api/etablissement/ressources/. Voir
app/espace_student/services/document_etudiant_service.py pour la regle de
visibilite.
"""
import mimetypes

from django.utils.text import slugify

from django.db.models import F
from django.http import FileResponse
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from app.administration.models import Ressource
from app.core.documents import TYPES_DOCUMENT
from app.core.exceptions import NotFoundError, ValidationError
from app.espace_student.api.serializers import DocumentEtudiantSerializer
from app.espace_student.permissions.eleve_permissions import IsStudentUser
from app.espace_student.services.document_etudiant_service import (
    DocumentEtudiantService,
    chemin_absolu,
)
from app.espace_student.utils import get_etudiant_for_auth_user

# Filtres documentes dans le schema : sans ca, la QueryDict ne se documente
# pas toute seule et la liste des filtres reste dans le code du front.
PARAMETRES_FILTRE = [
    OpenApiParameter("type_ressource", OpenApiTypes.STR, description="Ex : Devoir, TP, Rapport."),
    OpenApiParameter("classe_id", OpenApiTypes.INT, description="Ressources de cette classe."),
    OpenApiParameter("matiere_id", OpenApiTypes.INT),
    OpenApiParameter("niveau_id", OpenApiTypes.INT),
    OpenApiParameter("filiere_id", OpenApiTypes.INT),
    OpenApiParameter("annee_academique_id", OpenApiTypes.INT),
    OpenApiParameter("search", OpenApiTypes.STR, description="Titre, auteur, matière, description."),
]


def _service(request):
    etudiant = get_etudiant_for_auth_user(request.user)
    if etudiant is None:
        raise NotFoundError("Profil étudiant introuvable.")
    return DocumentEtudiantService(etudiant)


@extend_schema(
    tags=["Espace Eleve API"],
    summary="Documents visibles par l'étudiant",
    parameters=PARAMETRES_FILTRE,
    responses={200: DocumentEtudiantSerializer(many=True)},
)
@api_view(["GET"])
@permission_classes([IsStudentUser])
def document_list(request):
    """Liste les documents visibles, filtres appliques cote serveur."""
    try:
        service = _service(request)
    except NotFoundError as e:
        return Response({"detail": e.message}, status=status.HTTP_404_NOT_FOUND)

    ressources = service.liste(service.choisir_filtres(request.query_params))
    return Response(DocumentEtudiantSerializer(ressources, many=True).data)


@extend_schema(
    tags=["Espace Eleve API"],
    summary="Types de documents",
    responses={200: {"type": "array", "items": {"type": "object"}}},
)
@api_view(["GET"])
@permission_classes([IsStudentUser])
def document_types(request):
    """Types de documents, pour alimenter le menu de filtre."""
    return Response(
        [{"valeur": valeur, "libelle": libelle} for valeur, libelle in TYPES_DOCUMENT]
    )


@extend_schema(
    tags=["Espace Eleve API"],
    summary="Télécharger un document",
    responses={
        (200, "application/octet-stream"): OpenApiTypes.BINARY,
        404: {"type": "object"},
    },
)
@api_view(["GET"])
@permission_classes([IsStudentUser])
def document_telecharger(request, pk: int):
    """
    Envoie les octets du fichier joint, pas une page HTML a interpreter.

    Le nom propose vient du titre, nettoye, avec l'extension d'origine : c'est
    ce que l'etudiant retrouvera dans ses telechargements.
    """
    try:
        service = _service(request)
        ressource = service.visibles().filter(pk=pk).first()
        if ressource is None:
            # 404 et non 403 : un etudiant ne doit pas pouvoir deviner
            # l'existence d'un document qui n'est pas pour lui.
            raise NotFoundError("Document introuvable.")
        chemin = chemin_absolu(ressource)
    except NotFoundError as e:
        return Response({"detail": e.message}, status=status.HTTP_404_NOT_FOUND)
    except ValidationError as e:
        return Response({"detail": e.message}, status=status.HTTP_400_BAD_REQUEST)

    Ressource.objects.filter(pk=pk).update(
        nombre_telechargements=F("nombre_telechargements") + 1
    )

    reponse = FileResponse(chemin.open("rb"), as_attachment=True, filename=_nom(ressource))
    # FileResponse ne deduit rien du chemin, et un titre sans extension fait
    # qu certains navigateurs ouvrent le fichier au lieu de le telecharger.
    type_mime = mimetypes.guess_type(ressource.fichier or "")[0] or "application/octet-stream"
    reponse["Content-Type"] = type_mime
    return reponse


def _nom(ressource) -> str:
    """Nom de telechargement : titre nettoye + extension d'origine."""
    base = slugify(ressource.titre) or "document"
    extension = (ressource.format_fichier or "").strip().lstrip(".")
    if extension and not base.endswith(f".{extension}"):
        base = f"{base}.{extension}"
    return base