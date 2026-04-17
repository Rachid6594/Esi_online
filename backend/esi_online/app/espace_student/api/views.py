from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, extend_schema
from app.espace_student.services import EtudiantService
from app.espace_student.api.serializers import EtudiantSerializer
from app.core.exceptions import NotFoundError
from app.espace_student.permissions.espace_student_permissions import (
    CanViewEtudiant, CanCreateEtudiant,
    CanUpdateEtudiant, CanDeleteEtudiant,
)
from app.espace_student.services import RenduTPService
from app.espace_student.api.serializers import RenduTPSerializer
from app.espace_student.permissions.espace_student_permissions import (
    CanViewRenduTP, CanCreateRenduTP,
    CanUpdateRenduTP, CanDeleteRenduTP,
)
from app.espace_student.services import TentativeQCMService
from app.espace_student.api.serializers import TentativeQCMSerializer
from app.espace_student.permissions.espace_student_permissions import (
    CanViewTentativeQCM, CanCreateTentativeQCM,
    CanUpdateTentativeQCM, CanDeleteTentativeQCM,
)
from app.espace_student.services import ReponseEtudiantQCMService
from app.espace_student.api.serializers import ReponseEtudiantQCMSerializer
from app.espace_student.permissions.espace_student_permissions import (
    CanViewReponseEtudiantQCM, CanCreateReponseEtudiantQCM,
    CanUpdateReponseEtudiantQCM, CanDeleteReponseEtudiantQCM,
)

# --- Etudiant (CRUD + permissions) ---
@api_view(["GET", "POST"])
@permission_classes([
    CanViewEtudiant,
    CanCreateEtudiant,
])
def etudiant_list(request):
    """GET: liste | POST: création."""
    if request.method == "GET":
        service = EtudiantService()
        qs = service.list_all()
        serializer = EtudiantSerializer(qs, many=True)
        return Response(serializer.data)
    # POST
    serializer = EtudiantSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    service = EtudiantService()
    obj = service.create(**serializer.validated_data)
    serializer = EtudiantSerializer(obj)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([
    CanViewEtudiant,
    CanUpdateEtudiant,
    CanDeleteEtudiant,
])
def etudiant_detail(request, pk: int):
    """GET: détail | PUT/PATCH: modification | DELETE: suppression."""
    service = EtudiantService()
    try:
        obj = service.get_or_raise(pk)
    except NotFoundError as e:
        return Response({"detail": str(e.message)}, status=status.HTTP_404_NOT_FOUND)
    if request.method == "GET":
        serializer = EtudiantSerializer(obj)
        return Response(serializer.data)
    if request.method == "DELETE":
        service.delete(pk)
        return Response(status=status.HTTP_204_NO_CONTENT)
    # PUT / PATCH
    partial = request.method == "PATCH"
    serializer = EtudiantSerializer(obj, data=request.data, partial=partial)
    serializer.is_valid(raise_exception=True)
    updated = service.update(pk, **serializer.validated_data)
    return Response(EtudiantSerializer(updated).data)

# --- RenduTP (CRUD + permissions) ---
@api_view(["GET", "POST"])
@permission_classes([
    CanViewRenduTP,
    CanCreateRenduTP,
])
def rendutp_list(request):
    """GET: liste | POST: création."""
    if request.method == "GET":
        service = RenduTPService()
        qs = service.list_all()
        serializer = RenduTPSerializer(qs, many=True)
        return Response(serializer.data)
    # POST
    serializer = RenduTPSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    service = RenduTPService()
    obj = service.create(**serializer.validated_data)
    serializer = RenduTPSerializer(obj)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([
    CanViewRenduTP,
    CanUpdateRenduTP,
    CanDeleteRenduTP,
])
def rendutp_detail(request, pk: int):
    """GET: détail | PUT/PATCH: modification | DELETE: suppression."""
    service = RenduTPService()
    try:
        obj = service.get_or_raise(pk)
    except NotFoundError as e:
        return Response({"detail": str(e.message)}, status=status.HTTP_404_NOT_FOUND)
    if request.method == "GET":
        serializer = RenduTPSerializer(obj)
        return Response(serializer.data)
    if request.method == "DELETE":
        service.delete(pk)
        return Response(status=status.HTTP_204_NO_CONTENT)
    # PUT / PATCH
    partial = request.method == "PATCH"
    serializer = RenduTPSerializer(obj, data=request.data, partial=partial)
    serializer.is_valid(raise_exception=True)
    updated = service.update(pk, **serializer.validated_data)
    return Response(RenduTPSerializer(updated).data)

# --- TentativeQCM (CRUD + permissions) ---
@api_view(["GET", "POST"])
@permission_classes([
    CanViewTentativeQCM,
    CanCreateTentativeQCM,
])
def tentativeqcm_list(request):
    """GET: liste | POST: création."""
    if request.method == "GET":
        service = TentativeQCMService()
        qs = service.list_all()
        serializer = TentativeQCMSerializer(qs, many=True)
        return Response(serializer.data)
    # POST
    serializer = TentativeQCMSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    service = TentativeQCMService()
    obj = service.create(**serializer.validated_data)
    serializer = TentativeQCMSerializer(obj)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([
    CanViewTentativeQCM,
    CanUpdateTentativeQCM,
    CanDeleteTentativeQCM,
])
def tentativeqcm_detail(request, pk: int):
    """GET: détail | PUT/PATCH: modification | DELETE: suppression."""
    service = TentativeQCMService()
    try:
        obj = service.get_or_raise(pk)
    except NotFoundError as e:
        return Response({"detail": str(e.message)}, status=status.HTTP_404_NOT_FOUND)
    if request.method == "GET":
        serializer = TentativeQCMSerializer(obj)
        return Response(serializer.data)
    if request.method == "DELETE":
        service.delete(pk)
        return Response(status=status.HTTP_204_NO_CONTENT)
    # PUT / PATCH
    partial = request.method == "PATCH"
    serializer = TentativeQCMSerializer(obj, data=request.data, partial=partial)
    serializer.is_valid(raise_exception=True)
    updated = service.update(pk, **serializer.validated_data)
    return Response(TentativeQCMSerializer(updated).data)

# --- ReponseEtudiantQCM (CRUD + permissions) ---
@api_view(["GET", "POST"])
@permission_classes([
    CanViewReponseEtudiantQCM,
    CanCreateReponseEtudiantQCM,
])
def reponseetudiantqcm_list(request):
    """GET: liste | POST: création."""
    if request.method == "GET":
        service = ReponseEtudiantQCMService()
        qs = service.list_all()
        serializer = ReponseEtudiantQCMSerializer(qs, many=True)
        return Response(serializer.data)
    # POST
    serializer = ReponseEtudiantQCMSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    service = ReponseEtudiantQCMService()
    obj = service.create(**serializer.validated_data)
    serializer = ReponseEtudiantQCMSerializer(obj)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([
    CanViewReponseEtudiantQCM,
    CanUpdateReponseEtudiantQCM,
    CanDeleteReponseEtudiantQCM,
])
def reponseetudiantqcm_detail(request, pk: int):
    """GET: détail | PUT/PATCH: modification | DELETE: suppression."""
    service = ReponseEtudiantQCMService()
    try:
        obj = service.get_or_raise(pk)
    except NotFoundError as e:
        return Response({"detail": str(e.message)}, status=status.HTTP_404_NOT_FOUND)
    if request.method == "GET":
        serializer = ReponseEtudiantQCMSerializer(obj)
        return Response(serializer.data)
    if request.method == "DELETE":
        service.delete(pk)
        return Response(status=status.HTTP_204_NO_CONTENT)
    # PUT / PATCH
    partial = request.method == "PATCH"
    serializer = ReponseEtudiantQCMSerializer(obj, data=request.data, partial=partial)
    serializer.is_valid(raise_exception=True)
    updated = service.update(pk, **serializer.validated_data)
    return Response(ReponseEtudiantQCMSerializer(updated).data)


def _decorate_crud_endpoints(resource_name: str, serializer_class):
    """Ajoute une documentation OpenAPI homogène aux endpoints list/detail."""
    list_view_name = f"{resource_name}_list"
    detail_view_name = f"{resource_name}_detail"
    list_view = globals()[list_view_name]
    detail_view = globals()[detail_view_name]

    list_view = extend_schema(
        methods=["GET"],
        tags=["Espace Eleve API"],
        summary=f"Lister {resource_name}",
        responses={200: serializer_class(many=True)},
    )(list_view)
    list_view = extend_schema(
        methods=["POST"],
        tags=["Espace Eleve API"],
        summary=f"Creer {resource_name}",
        request=serializer_class,
        responses={201: serializer_class, 400: OpenApiTypes.OBJECT},
    )(list_view)

    detail_view = extend_schema(
        methods=["GET"],
        tags=["Espace Eleve API"],
        summary=f"Detail {resource_name}",
        parameters=[OpenApiParameter("pk", OpenApiTypes.INT, OpenApiParameter.PATH, required=True)],
        responses={200: serializer_class, 404: OpenApiTypes.OBJECT},
    )(detail_view)
    detail_view = extend_schema(
        methods=["PUT"],
        tags=["Espace Eleve API"],
        summary=f"Remplacer {resource_name}",
        parameters=[OpenApiParameter("pk", OpenApiTypes.INT, OpenApiParameter.PATH, required=True)],
        request=serializer_class,
        responses={200: serializer_class, 400: OpenApiTypes.OBJECT, 404: OpenApiTypes.OBJECT},
    )(detail_view)
    detail_view = extend_schema(
        methods=["PATCH"],
        tags=["Espace Eleve API"],
        summary=f"Modifier partiellement {resource_name}",
        parameters=[OpenApiParameter("pk", OpenApiTypes.INT, OpenApiParameter.PATH, required=True)],
        request=serializer_class,
        responses={200: serializer_class, 400: OpenApiTypes.OBJECT, 404: OpenApiTypes.OBJECT},
    )(detail_view)
    detail_view = extend_schema(
        methods=["DELETE"],
        tags=["Espace Eleve API"],
        summary=f"Supprimer {resource_name}",
        parameters=[OpenApiParameter("pk", OpenApiTypes.INT, OpenApiParameter.PATH, required=True)],
        responses={204: None, 404: OpenApiTypes.OBJECT},
    )(detail_view)

    globals()[list_view_name] = list_view
    globals()[detail_view_name] = detail_view


_decorate_crud_endpoints("etudiant", EtudiantSerializer)
_decorate_crud_endpoints("rendutp", RenduTPSerializer)
_decorate_crud_endpoints("tentativeqcm", TentativeQCMSerializer)
_decorate_crud_endpoints("reponseetudiantqcm", ReponseEtudiantQCMSerializer)

