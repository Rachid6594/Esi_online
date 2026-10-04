from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, extend_schema
from app.espace_student.services import EtudiantService
from app.espace_student.api.serializers import EtudiantSerializer
from app.core.exceptions import NotFoundError
from app.espace_student.utils import get_etudiant_for_auth_user
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


# --- Portee des donnees etUDIantes -----------------------------------------
# Ces endpoints sont montes sous /api/eleve/ et lisent des donnees qui
# appartiennent a un etudiant precis. Sans le filtrage ci-dessous, un compte
# disposant de la permission de lecture voyait les rendus et les tentatives de
# toute l'ecole. Le staff (enseignant, admin) garde la vue complete, c'est lui
# qui corrige.


def _est_staff(request) -> bool:
    return bool(request.user and request.user.is_authenticated and request.user.is_staff)


def _etudiant_du_requester(request):
    """Profil Etudiant du demandeur, ou None s'il n'en a pas encore."""
    return get_etudiant_for_auth_user(request.user)


def _contexte(request):
    """Les serializers filtrent les champs proteges grace a la request."""
    return {"request": request}


def _liste_scopee(request, service):
    """Queryset de la liste : tout pour le staff, juste son profil sinon."""
    if _est_staff(request):
        return service.list_all()
    etudiant = _etudiant_du_requester(request)
    if etudiant is None:
        return None
    return service.list_pour_etudiant(etudiant)


def _detail_scope(request, service, pk: int):
    """Objet du detail, restreint au proprietaire pour un non-staff."""
    if _est_staff(request):
        return service.get_or_raise(pk)
    etudiant = _etudiant_du_requester(request)
    if etudiant is None:
        return None
    return service.get_pour_etudiant(pk, etudiant)


AUCUN_PROFIL_ETUDIANT = Response(
    {"detail": "Ce compte n'a pas de profil etudiant associe."},
    status=status.HTTP_403_FORBIDDEN,
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
    service = RenduTPService()
    if request.method == "GET":
        qs = _liste_scopee(request, service)
        if qs is None:
            return AUCUN_PROFIL_ETUDIANT
        return Response(RenduTPSerializer(qs, many=True, context=_contexte(request)).data)
    # POST
    serializer = RenduTPSerializer(data=request.data, context=_contexte(request))
    serializer.is_valid(raise_exception=True)
    donnees = serializer.validated_data
    if not _est_staff(request):
        # Un etudiant depose pour lui-meme : le champ "etudiant" envoye par le
        # client est ecrase, sinon il pourrait deposer a la place d un autre.
        etudiant = _etudiant_du_requester(request)
        if etudiant is None:
            return AUCUN_PROFIL_ETUDIANT
        donnees["etudiant"] = etudiant
    elif not donnees.get("etudiant"):
        return Response(
            {"etudiant": ["Ce champ est obligatoire pour un dépôt fait par un enseignant."]},
            status=status.HTTP_400_BAD_REQUEST,
        )
    obj = service.create(**donnees)
    return Response(
        RenduTPSerializer(obj, context=_contexte(request)).data,
        status=status.HTTP_201_CREATED,
    )


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
        obj = _detail_scope(request, service, pk)
    except NotFoundError as e:
        return Response({"detail": str(e.message)}, status=status.HTTP_404_NOT_FOUND)
    if obj is None:
        # Rendu absent, ou appartenant a quelqu'un d'autre : meme reponse dans
        # les deux cas, pour ne pas divulguer l'existence du rendu.
        return Response({"detail": "Rendu introuvable."}, status=status.HTTP_404_NOT_FOUND)
    if request.method == "GET":
        return Response(RenduTPSerializer(obj, context=_contexte(request)).data)
    if request.method == "DELETE":
        service.delete(pk)
        return Response(status=status.HTTP_204_NO_CONTENT)
    # PUT / PATCH
    partial = request.method == "PATCH"
    serializer = RenduTPSerializer(
        obj, data=request.data, partial=partial, context=_contexte(request)
    )
    serializer.is_valid(raise_exception=True)
    updated = service.update(pk, **serializer.validated_data)
    return Response(RenduTPSerializer(updated, context=_contexte(request)).data)

# --- TentativeQCM (CRUD + permissions) ---
@api_view(["GET", "POST"])
@permission_classes([
    CanViewTentativeQCM,
    CanCreateTentativeQCM,
])
def tentativeqcm_list(request):
    """GET: liste | POST: création."""
    service = TentativeQCMService()
    if request.method == "GET":
        qs = _liste_scopee(request, service)
        if qs is None:
            return AUCUN_PROFIL_ETUDIANT
        return Response(TentativeQCMSerializer(qs, many=True, context=_contexte(request)).data)
    # POST : ouvrir une tentative
    serializer = TentativeQCMSerializer(data=request.data, context=_contexte(request))
    serializer.is_valid(raise_exception=True)
    donnees = serializer.validated_data
    if not _est_staff(request):
        etudiant = _etudiant_du_requester(request)
        if etudiant is None:
            return AUCUN_PROFIL_ETUDIANT
        donnees["etudiant"] = etudiant
        # Le client ne choisit pas son numero de tentative ni son statut : ces
        # champs sont proteges et rejetes plus haut s il les envoie.
        donnees.setdefault("numero_tentative", 1)
        donnees.setdefault("statut", "EN_COURS")
    elif not donnees.get("etudiant"):
        return Response(
            {"etudiant": ["Ce champ est obligatoire pour une tentative créée par un enseignant."]},
            status=status.HTTP_400_BAD_REQUEST,
        )
    obj = service.create(**donnees)
    return Response(
        TentativeQCMSerializer(obj, context=_contexte(request)).data,
        status=status.HTTP_201_CREATED,
    )


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
        obj = _detail_scope(request, service, pk)
    except NotFoundError as e:
        return Response({"detail": str(e.message)}, status=status.HTTP_404_NOT_FOUND)
    if obj is None:
        return Response(
            {"detail": "Tentative introuvable."}, status=status.HTTP_404_NOT_FOUND
        )
    if request.method == "GET":
        return Response(TentativeQCMSerializer(obj, context=_contexte(request)).data)
    if request.method == "DELETE":
        service.delete(pk)
        return Response(status=status.HTTP_204_NO_CONTENT)
    # PUT / PATCH
    partial = request.method == "PATCH"
    serializer = TentativeQCMSerializer(
        obj, data=request.data, partial=partial, context=_contexte(request)
    )
    serializer.is_valid(raise_exception=True)
    updated = service.update(pk, **serializer.validated_data)
    return Response(TentativeQCMSerializer(updated, context=_contexte(request)).data)

# --- ReponseEtudiantQCM (CRUD + permissions) ---
@api_view(["GET", "POST"])
@permission_classes([
    CanViewReponseEtudiantQCM,
    CanCreateReponseEtudiantQCM,
])
def reponseetudiantqcm_list(request):
    """GET: liste | POST: création."""
    service = ReponseEtudiantQCMService()
    if request.method == "GET":
        qs = _liste_scopee(request, service)
        if qs is None:
            return AUCUN_PROFIL_ETUDIANT
        return Response(
            ReponseEtudiantQCMSerializer(qs, many=True, context=_contexte(request)).data
        )
    # POST : repondre a une question
    serializer = ReponseEtudiantQCMSerializer(
        data=request.data, context=_contexte(request)
    )
    serializer.is_valid(raise_exception=True)
    if not _est_staff(request):
        # La reponse se rattache a une tentative : on verifie qu elle est bien
        # celle du demandeur, sinon il repondrait dans la tentative d un autre.
        etudiant = _etudiant_du_requester(request)
        if etudiant is None:
            return AUCUN_PROFIL_ETUDIANT
        tentative = serializer.validated_data["tentative"]
        if not TentativeQCMService().get_pour_etudiant(tentative.pk, etudiant):
            return Response(
                {"tentative": ["Tentative introuvable."]},
                status=status.HTTP_400_BAD_REQUEST,
            )
    obj = service.create(**serializer.validated_data)
    return Response(
        ReponseEtudiantQCMSerializer(obj, context=_contexte(request)).data,
        status=status.HTTP_201_CREATED,
    )


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
        obj = _detail_scope(request, service, pk)
    except NotFoundError as e:
        return Response({"detail": str(e.message)}, status=status.HTTP_404_NOT_FOUND)
    if obj is None:
        return Response(
            {"detail": "Reponse introuvable."}, status=status.HTTP_404_NOT_FOUND
        )
    if request.method == "GET":
        return Response(
            ReponseEtudiantQCMSerializer(obj, context=_contexte(request)).data
        )
    if request.method == "DELETE":
        service.delete(pk)
        return Response(status=status.HTTP_204_NO_CONTENT)
    # PUT / PATCH
    partial = request.method == "PATCH"
    serializer = ReponseEtudiantQCMSerializer(
        obj, data=request.data, partial=partial, context=_contexte(request)
    )
    serializer.is_valid(raise_exception=True)
    updated = service.update(pk, **serializer.validated_data)
    return Response(
        ReponseEtudiantQCMSerializer(updated, context=_contexte(request)).data
    )


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

