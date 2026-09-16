"""Endpoints API : permissions upload + upload étudiant."""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import BasePermission, IsAuthenticated
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiResponse
from drf_spectacular.types import OpenApiTypes

from app.core.exceptions import NotFoundError, ValidationError
from app.espace_student.models import TYPE_UPLOAD_CHOICES
from app.espace_student.services.permission_upload_service import PermissionUploadService


class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_superuser
        )


class IsStudentUser(BasePermission):
    """Étudiant = authentifié, non staff, non superuser."""
    def has_permission(self, request, view):
        u = request.user
        return bool(
            u
            and u.is_authenticated
            and not u.is_staff
            and not u.is_superuser
        )


@extend_schema(
    tags=["Upload étudiant"],
    summary="Types de ressources uploadables",
    responses={200: OpenApiResponse(description="Liste des types.")},
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def upload_types(request):
    return Response([{"value": v, "label": l} for v, l in TYPE_UPLOAD_CHOICES])


@extend_schema(
    tags=["Upload étudiant"],
    summary="Lister / créer les permissions d'upload (admin)",
)
@api_view(["GET", "POST"])
@permission_classes([IsSuperAdmin])
def upload_permissions_list(request):
    service = PermissionUploadService()
    if request.method == "GET":
        data = [service.serialize(p) for p in service.list_all()]
        return Response(data)

    body = request.data or {}
    try:
        user_id = body.get("user_id")
        if user_id is None:
            raise ValidationError("user_id est requis.")
        perm = service.grant(
            auth_user_id=int(user_id),
            types_autorises=body.get("types_autorises") or [],
            is_active=body.get("is_active", True),
            note=body.get("note") or "",
            accorde_par=request.user,
        )
        return Response(service.serialize(perm), status=status.HTTP_201_CREATED)
    except ValidationError as e:
        return Response({"detail": e.message}, status=status.HTTP_400_BAD_REQUEST)
    except NotFoundError as e:
        return Response({"detail": e.message}, status=status.HTTP_404_NOT_FOUND)


@extend_schema(
    tags=["Upload étudiant"],
    summary="Modifier / révoquer une permission d'upload (admin)",
)
@api_view(["GET", "PATCH", "PUT", "DELETE"])
@permission_classes([IsSuperAdmin])
def upload_permissions_detail(request, pk: int):
    service = PermissionUploadService()
    try:
        if request.method == "GET":
            return Response(service.serialize(service.get_or_raise(pk)))
        if request.method == "DELETE":
            service.revoke(pk)
            return Response(status=status.HTTP_204_NO_CONTENT)
        body = request.data or {}
        perm = service.update(
            pk,
            types_autorises=body.get("types_autorises"),
            is_active=body.get("is_active"),
            note=body.get("note"),
        )
        return Response(service.serialize(perm))
    except ValidationError as e:
        return Response({"detail": e.message}, status=status.HTTP_400_BAD_REQUEST)
    except NotFoundError as e:
        return Response({"detail": e.message}, status=status.HTTP_404_NOT_FOUND)


@extend_schema(
    tags=["Upload étudiant"],
    summary="Ma permission d'upload (étudiant connecté)",
)
@api_view(["GET"])
@permission_classes([IsStudentUser])
def my_upload_permission(request):
    service = PermissionUploadService()
    perm = service.get_for_auth_user(request.user)
    if not perm:
        return Response({
            "allowed": False,
            "is_active": False,
            "types_autorises": [],
        })
    return Response({
        "allowed": perm.is_active and bool(perm.types_normes()),
        "is_active": perm.is_active,
        "types_autorises": perm.types_normes(),
        "note": perm.note or "",
        "id": perm.id,
    })


@extend_schema(
    tags=["Upload étudiant"],
    summary="Uploader un fichier (étudiant autorisé)",
    request={
        "multipart/form-data": {
            "type": "object",
            "properties": {
                "titre": {"type": "string"},
                "type_ressource": {"type": "string"},
                "description": {"type": "string"},
                "matiere_id": {"type": "integer"},
                "fichier": {"type": "string", "format": "binary"},
            },
            "required": ["titre", "type_ressource", "fichier"],
        }
    },
    responses={201: OpenApiResponse(description="Ressource créée.")},
)
@api_view(["POST"])
@permission_classes([IsStudentUser])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def my_upload_ressource(request):
    service = PermissionUploadService()
    try:
        matiere_id = request.data.get("matiere_id")
        if matiere_id in ("", None):
            matiere_id = None
        else:
            matiere_id = int(matiere_id)
        ressource = service.upload_ressource(
            auth_user=request.user,
            titre=request.data.get("titre") or "",
            type_ressource=request.data.get("type_ressource") or "",
            uploaded_file=request.FILES.get("fichier") or request.FILES.get("file"),
            description=request.data.get("description") or "",
            matiere_id=matiere_id,
        )
        return Response(
            {
                "id": ressource.id,
                "titre": ressource.titre,
                "type_ressource": ressource.type_ressource,
                "fichier": ressource.fichier,
                "taille_fichier": ressource.taille_fichier,
                "message": "Fichier uploadé avec succès.",
            },
            status=status.HTTP_201_CREATED,
        )
    except ValidationError as e:
        return Response({"detail": e.message}, status=status.HTTP_400_BAD_REQUEST)
    except NotFoundError as e:
        return Response({"detail": e.message}, status=status.HTTP_404_NOT_FOUND)
