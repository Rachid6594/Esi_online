from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from app.administration.services import AnneeAcademiqueService
from app.administration.api.serializers import AnneeAcademiqueSerializer
from app.core.exceptions import NotFoundError
from app.administration.permissions.administration_permissions import (
    CanViewAnneeAcademique, CanCreateAnneeAcademique,
    CanUpdateAnneeAcademique, CanDeleteAnneeAcademique,
)
from app.administration.services import NiveauService
from app.administration.api.serializers import NiveauSerializer
from app.administration.permissions.administration_permissions import (
    CanViewNiveau, CanCreateNiveau,
    CanUpdateNiveau, CanDeleteNiveau,
)
from app.administration.services import FiliereService
from app.administration.api.serializers import FiliereSerializer
from app.administration.permissions.administration_permissions import (
    CanViewFiliere, CanCreateFiliere,
    CanUpdateFiliere, CanDeleteFiliere,
)
from app.administration.services import ClasseService
from app.administration.api.serializers import ClasseSerializer
from app.administration.permissions.administration_permissions import (
    CanViewClasse, CanCreateClasse,
    CanUpdateClasse, CanDeleteClasse,
)
from app.administration.services import MatiereService
from app.administration.api.serializers import MatiereSerializer
from app.administration.permissions.administration_permissions import (
    CanViewMatiere, CanCreateMatiere,
    CanUpdateMatiere, CanDeleteMatiere,
)
from app.administration.services import AdministrationEcoleService
from app.administration.api.serializers import AdministrationEcoleSerializer
from app.administration.permissions.administration_permissions import (
    CanViewAdministrationEcole, CanCreateAdministrationEcole,
    CanUpdateAdministrationEcole, CanDeleteAdministrationEcole,
)
from app.administration.services import AnnonceService
from app.administration.api.serializers import AnnonceSerializer
from app.administration.permissions.administration_permissions import (
    CanViewAnnonce, CanCreateAnnonce,
    CanUpdateAnnonce, CanDeleteAnnonce,
)
from app.administration.services import LectureAnnonceService
from app.administration.api.serializers import LectureAnnonceSerializer
from app.administration.permissions.administration_permissions import (
    CanViewLectureAnnonce, CanCreateLectureAnnonce,
    CanUpdateLectureAnnonce, CanDeleteLectureAnnonce,
)
from app.administration.services import EmploiDuTempsService
from app.administration.api.serializers import EmploiDuTempsSerializer
from app.administration.permissions.administration_permissions import (
    CanViewEmploiDuTemps, CanCreateEmploiDuTemps,
    CanUpdateEmploiDuTemps, CanDeleteEmploiDuTemps,
)
from app.administration.services import EvenementService
from app.administration.api.serializers import EvenementSerializer
from app.administration.permissions.administration_permissions import (
    CanViewEvenement, CanCreateEvenement,
    CanUpdateEvenement, CanDeleteEvenement,
)
from app.administration.services import CategorieService
from app.administration.api.serializers import CategorieSerializer
from app.administration.permissions.administration_permissions import (
    CanViewCategorie, CanCreateCategorie,
    CanUpdateCategorie, CanDeleteCategorie,
)
from app.administration.services import TagService
from app.administration.api.serializers import TagSerializer
from app.administration.permissions.administration_permissions import (
    CanViewTag, CanCreateTag,
    CanUpdateTag, CanDeleteTag,
)
from app.administration.services import AffectationEnseignantService
from app.administration.api.serializers import AffectationEnseignantSerializer
from app.administration.permissions.administration_permissions import (
    CanViewAffectationEnseignant, CanCreateAffectationEnseignant,
    CanUpdateAffectationEnseignant, CanDeleteAffectationEnseignant,
)
from app.administration.services import RessourceService
from app.administration.api.serializers import RessourceSerializer
from app.administration.permissions.administration_permissions import (
    CanViewRessource, CanCreateRessource,
    CanUpdateRessource, CanDeleteRessource,
)
from app.administration.services import ConsultationRessourceService
from app.administration.api.serializers import ConsultationRessourceSerializer
from app.administration.permissions.administration_permissions import (
    CanViewConsultationRessource, CanCreateConsultationRessource,
    CanUpdateConsultationRessource, CanDeleteConsultationRessource,
)
from app.administration.services import ExemplaireService
from app.administration.api.serializers import ExemplaireSerializer
from app.administration.permissions.administration_permissions import (
    CanViewExemplaire, CanCreateExemplaire,
    CanUpdateExemplaire, CanDeleteExemplaire,
)
from app.administration.services import EmpruntService
from app.administration.api.serializers import EmpruntSerializer
from app.administration.permissions.administration_permissions import (
    CanViewEmprunt, CanCreateEmprunt,
    CanUpdateEmprunt, CanDeleteEmprunt,
)
from app.administration.services import ReservationService
from app.administration.api.serializers import ReservationSerializer
from app.administration.permissions.administration_permissions import (
    CanViewReservation, CanCreateReservation,
    CanUpdateReservation, CanDeleteReservation,
)
from app.administration.services import MessageService
from app.administration.api.serializers import MessageSerializer
from app.administration.permissions.administration_permissions import (
    CanViewMessage, CanCreateMessage,
    CanUpdateMessage, CanDeleteMessage,
)
from app.administration.services import ForumService
from app.administration.api.serializers import ForumSerializer
from app.administration.permissions.administration_permissions import (
    CanViewForum, CanCreateForum,
    CanUpdateForum, CanDeleteForum,
)
from app.administration.services import SujetService
from app.administration.api.serializers import SujetSerializer
from app.administration.permissions.administration_permissions import (
    CanViewSujet, CanCreateSujet,
    CanUpdateSujet, CanDeleteSujet,
)
from app.administration.services import ReponseService
from app.administration.api.serializers import ReponseSerializer
from app.administration.permissions.administration_permissions import (
    CanViewReponse, CanCreateReponse,
    CanUpdateReponse, CanDeleteReponse,
)
from app.administration.services import ReactionReponseService
from app.administration.api.serializers import ReactionReponseSerializer
from app.administration.permissions.administration_permissions import (
    CanViewReactionReponse, CanCreateReactionReponse,
    CanUpdateReactionReponse, CanDeleteReactionReponse,
)

# --- AnneeAcademique (CRUD + permissions) ---
@api_view(["GET", "POST"])
@permission_classes([
    CanViewAnneeAcademique,
    CanCreateAnneeAcademique,
])
def anneeacademique_list(request):
    """GET: liste | POST: création."""
    if request.method == "GET":
        service = AnneeAcademiqueService()
        qs = service.list_all()
        serializer = AnneeAcademiqueSerializer(qs, many=True)
        return Response(serializer.data)
    # POST
    serializer = AnneeAcademiqueSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    service = AnneeAcademiqueService()
    obj = service.create(**serializer.validated_data)
    serializer = AnneeAcademiqueSerializer(obj)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([
    CanViewAnneeAcademique,
    CanUpdateAnneeAcademique,
    CanDeleteAnneeAcademique,
])
def anneeacademique_detail(request, pk: int):
    """GET: détail | PUT/PATCH: modification | DELETE: suppression."""
    service = AnneeAcademiqueService()
    try:
        obj = service.get_or_raise(pk)
    except NotFoundError as e:
        return Response({"detail": str(e.message)}, status=status.HTTP_404_NOT_FOUND)
    if request.method == "GET":
        serializer = AnneeAcademiqueSerializer(obj)
        return Response(serializer.data)
    if request.method == "DELETE":
        service.delete(pk)
        return Response(status=status.HTTP_204_NO_CONTENT)
    # PUT / PATCH
    partial = request.method == "PATCH"
    serializer = AnneeAcademiqueSerializer(obj, data=request.data, partial=partial)
    serializer.is_valid(raise_exception=True)
    updated = service.update(pk, **serializer.validated_data)
    return Response(AnneeAcademiqueSerializer(updated).data)

# --- Niveau (CRUD + permissions) ---
@api_view(["GET", "POST"])
@permission_classes([
    CanViewNiveau,
    CanCreateNiveau,
])
def niveau_list(request):
    """GET: liste | POST: création."""
    if request.method == "GET":
        service = NiveauService()
        qs = service.list_all()
        serializer = NiveauSerializer(qs, many=True)
        return Response(serializer.data)
    # POST
    serializer = NiveauSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    service = NiveauService()
    obj = service.create(**serializer.validated_data)
    serializer = NiveauSerializer(obj)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([
    CanViewNiveau,
    CanUpdateNiveau,
    CanDeleteNiveau,
])
def niveau_detail(request, pk: int):
    """GET: détail | PUT/PATCH: modification | DELETE: suppression."""
    service = NiveauService()
    try:
        obj = service.get_or_raise(pk)
    except NotFoundError as e:
        return Response({"detail": str(e.message)}, status=status.HTTP_404_NOT_FOUND)
    if request.method == "GET":
        serializer = NiveauSerializer(obj)
        return Response(serializer.data)
    if request.method == "DELETE":
        service.delete(pk)
        return Response(status=status.HTTP_204_NO_CONTENT)
    # PUT / PATCH
    partial = request.method == "PATCH"
    serializer = NiveauSerializer(obj, data=request.data, partial=partial)
    serializer.is_valid(raise_exception=True)
    updated = service.update(pk, **serializer.validated_data)
    return Response(NiveauSerializer(updated).data)

# --- Filiere (CRUD + permissions) ---
@api_view(["GET", "POST"])
@permission_classes([
    CanViewFiliere,
    CanCreateFiliere,
])
def filiere_list(request):
    """GET: liste | POST: création."""
    if request.method == "GET":
        service = FiliereService()
        qs = service.list_all()
        serializer = FiliereSerializer(qs, many=True)
        return Response(serializer.data)
    # POST
    serializer = FiliereSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    service = FiliereService()
    obj = service.create(**serializer.validated_data)
    serializer = FiliereSerializer(obj)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([
    CanViewFiliere,
    CanUpdateFiliere,
    CanDeleteFiliere,
])
def filiere_detail(request, pk: int):
    """GET: détail | PUT/PATCH: modification | DELETE: suppression."""
    service = FiliereService()
    try:
        obj = service.get_or_raise(pk)
    except NotFoundError as e:
        return Response({"detail": str(e.message)}, status=status.HTTP_404_NOT_FOUND)
    if request.method == "GET":
        serializer = FiliereSerializer(obj)
        return Response(serializer.data)
    if request.method == "DELETE":
        service.delete(pk)
        return Response(status=status.HTTP_204_NO_CONTENT)
    # PUT / PATCH
    partial = request.method == "PATCH"
    serializer = FiliereSerializer(obj, data=request.data, partial=partial)
    serializer.is_valid(raise_exception=True)
    updated = service.update(pk, **serializer.validated_data)
    return Response(FiliereSerializer(updated).data)

# --- Classe (CRUD + permissions) ---
@api_view(["GET", "POST"])
@permission_classes([
    CanViewClasse,
    CanCreateClasse,
])
def classe_list(request):
    """GET: liste | POST: création."""
    if request.method == "GET":
        service = ClasseService()
        qs = service.list_all()
        serializer = ClasseSerializer(qs, many=True)
        return Response(serializer.data)
    # POST
    serializer = ClasseSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    service = ClasseService()
    obj = service.create(**serializer.validated_data)
    serializer = ClasseSerializer(obj)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([
    CanViewClasse,
    CanUpdateClasse,
    CanDeleteClasse,
])
def classe_detail(request, pk: int):
    """GET: détail | PUT/PATCH: modification | DELETE: suppression."""
    service = ClasseService()
    try:
        obj = service.get_or_raise(pk)
    except NotFoundError as e:
        return Response({"detail": str(e.message)}, status=status.HTTP_404_NOT_FOUND)
    if request.method == "GET":
        serializer = ClasseSerializer(obj)
        return Response(serializer.data)
    if request.method == "DELETE":
        service.delete(pk)
        return Response(status=status.HTTP_204_NO_CONTENT)
    # PUT / PATCH
    partial = request.method == "PATCH"
    serializer = ClasseSerializer(obj, data=request.data, partial=partial)
    serializer.is_valid(raise_exception=True)
    updated = service.update(pk, **serializer.validated_data)
    return Response(ClasseSerializer(updated).data)

# --- Matiere (CRUD + permissions) ---
@api_view(["GET", "POST"])
@permission_classes([
    CanViewMatiere,
    CanCreateMatiere,
])
def matiere_list(request):
    """GET: liste | POST: création."""
    if request.method == "GET":
        service = MatiereService()
        qs = service.list_all()
        serializer = MatiereSerializer(qs, many=True)
        return Response(serializer.data)
    # POST
    serializer = MatiereSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    service = MatiereService()
    obj = service.create(**serializer.validated_data)
    serializer = MatiereSerializer(obj)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([
    CanViewMatiere,
    CanUpdateMatiere,
    CanDeleteMatiere,
])
def matiere_detail(request, pk: int):
    """GET: détail | PUT/PATCH: modification | DELETE: suppression."""
    service = MatiereService()
    try:
        obj = service.get_or_raise(pk)
    except NotFoundError as e:
        return Response({"detail": str(e.message)}, status=status.HTTP_404_NOT_FOUND)
    if request.method == "GET":
        serializer = MatiereSerializer(obj)
        return Response(serializer.data)
    if request.method == "DELETE":
        service.delete(pk)
        return Response(status=status.HTTP_204_NO_CONTENT)
    # PUT / PATCH
    partial = request.method == "PATCH"
    serializer = MatiereSerializer(obj, data=request.data, partial=partial)
    serializer.is_valid(raise_exception=True)
    updated = service.update(pk, **serializer.validated_data)
    return Response(MatiereSerializer(updated).data)

# --- AdministrationEcole (CRUD + permissions) ---
@api_view(["GET", "POST"])
@permission_classes([
    CanViewAdministrationEcole,
    CanCreateAdministrationEcole,
])
def administrationecole_list(request):
    """GET: liste | POST: création."""
    if request.method == "GET":
        service = AdministrationEcoleService()
        qs = service.list_all()
        serializer = AdministrationEcoleSerializer(qs, many=True)
        return Response(serializer.data)
    # POST
    serializer = AdministrationEcoleSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    service = AdministrationEcoleService()
    obj = service.create(**serializer.validated_data)
    serializer = AdministrationEcoleSerializer(obj)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([
    CanViewAdministrationEcole,
    CanUpdateAdministrationEcole,
    CanDeleteAdministrationEcole,
])
def administrationecole_detail(request, pk: int):
    """GET: détail | PUT/PATCH: modification | DELETE: suppression."""
    service = AdministrationEcoleService()
    try:
        obj = service.get_or_raise(pk)
    except NotFoundError as e:
        return Response({"detail": str(e.message)}, status=status.HTTP_404_NOT_FOUND)
    if request.method == "GET":
        serializer = AdministrationEcoleSerializer(obj)
        return Response(serializer.data)
    if request.method == "DELETE":
        service.delete(pk)
        return Response(status=status.HTTP_204_NO_CONTENT)
    # PUT / PATCH
    partial = request.method == "PATCH"
    serializer = AdministrationEcoleSerializer(obj, data=request.data, partial=partial)
    serializer.is_valid(raise_exception=True)
    updated = service.update(pk, **serializer.validated_data)
    return Response(AdministrationEcoleSerializer(updated).data)

# --- Annonce (CRUD + permissions) ---
@api_view(["GET", "POST"])
@permission_classes([
    CanViewAnnonce,
    CanCreateAnnonce,
])
def annonce_list(request):
    """GET: liste | POST: création."""
    if request.method == "GET":
        service = AnnonceService()
        qs = service.list_all()
        serializer = AnnonceSerializer(qs, many=True)
        return Response(serializer.data)
    # POST
    serializer = AnnonceSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    service = AnnonceService()
    obj = service.create(**serializer.validated_data)
    serializer = AnnonceSerializer(obj)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([
    CanViewAnnonce,
    CanUpdateAnnonce,
    CanDeleteAnnonce,
])
def annonce_detail(request, pk: int):
    """GET: détail | PUT/PATCH: modification | DELETE: suppression."""
    service = AnnonceService()
    try:
        obj = service.get_or_raise(pk)
    except NotFoundError as e:
        return Response({"detail": str(e.message)}, status=status.HTTP_404_NOT_FOUND)
    if request.method == "GET":
        serializer = AnnonceSerializer(obj)
        return Response(serializer.data)
    if request.method == "DELETE":
        service.delete(pk)
        return Response(status=status.HTTP_204_NO_CONTENT)
    # PUT / PATCH
    partial = request.method == "PATCH"
    serializer = AnnonceSerializer(obj, data=request.data, partial=partial)
    serializer.is_valid(raise_exception=True)
    updated = service.update(pk, **serializer.validated_data)
    return Response(AnnonceSerializer(updated).data)

# --- LectureAnnonce (CRUD + permissions) ---
@api_view(["GET", "POST"])
@permission_classes([
    CanViewLectureAnnonce,
    CanCreateLectureAnnonce,
])
def lectureannonce_list(request):
    """GET: liste | POST: création."""
    if request.method == "GET":
        service = LectureAnnonceService()
        qs = service.list_all()
        serializer = LectureAnnonceSerializer(qs, many=True)
        return Response(serializer.data)
    # POST
    serializer = LectureAnnonceSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    service = LectureAnnonceService()
    obj = service.create(**serializer.validated_data)
    serializer = LectureAnnonceSerializer(obj)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([
    CanViewLectureAnnonce,
    CanUpdateLectureAnnonce,
    CanDeleteLectureAnnonce,
])
def lectureannonce_detail(request, pk: int):
    """GET: détail | PUT/PATCH: modification | DELETE: suppression."""
    service = LectureAnnonceService()
    try:
        obj = service.get_or_raise(pk)
    except NotFoundError as e:
        return Response({"detail": str(e.message)}, status=status.HTTP_404_NOT_FOUND)
    if request.method == "GET":
        serializer = LectureAnnonceSerializer(obj)
        return Response(serializer.data)
    if request.method == "DELETE":
        service.delete(pk)
        return Response(status=status.HTTP_204_NO_CONTENT)
    # PUT / PATCH
    partial = request.method == "PATCH"
    serializer = LectureAnnonceSerializer(obj, data=request.data, partial=partial)
    serializer.is_valid(raise_exception=True)
    updated = service.update(pk, **serializer.validated_data)
    return Response(LectureAnnonceSerializer(updated).data)

# --- EmploiDuTemps (CRUD + permissions) ---
@api_view(["GET", "POST"])
@permission_classes([
    CanViewEmploiDuTemps,
    CanCreateEmploiDuTemps,
])
def emploidutemps_list(request):
    """GET: liste | POST: création."""
    if request.method == "GET":
        service = EmploiDuTempsService()
        qs = service.list_all()
        serializer = EmploiDuTempsSerializer(qs, many=True)
        return Response(serializer.data)
    # POST
    serializer = EmploiDuTempsSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    service = EmploiDuTempsService()
    obj = service.create(**serializer.validated_data)
    serializer = EmploiDuTempsSerializer(obj)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([
    CanViewEmploiDuTemps,
    CanUpdateEmploiDuTemps,
    CanDeleteEmploiDuTemps,
])
def emploidutemps_detail(request, pk: int):
    """GET: détail | PUT/PATCH: modification | DELETE: suppression."""
    service = EmploiDuTempsService()
    try:
        obj = service.get_or_raise(pk)
    except NotFoundError as e:
        return Response({"detail": str(e.message)}, status=status.HTTP_404_NOT_FOUND)
    if request.method == "GET":
        serializer = EmploiDuTempsSerializer(obj)
        return Response(serializer.data)
    if request.method == "DELETE":
        service.delete(pk)
        return Response(status=status.HTTP_204_NO_CONTENT)
    # PUT / PATCH
    partial = request.method == "PATCH"
    serializer = EmploiDuTempsSerializer(obj, data=request.data, partial=partial)
    serializer.is_valid(raise_exception=True)
    updated = service.update(pk, **serializer.validated_data)
    return Response(EmploiDuTempsSerializer(updated).data)

# --- Evenement (CRUD + permissions) ---
@api_view(["GET", "POST"])
@permission_classes([
    CanViewEvenement,
    CanCreateEvenement,
])
def evenement_list(request):
    """GET: liste | POST: création."""
    if request.method == "GET":
        service = EvenementService()
        qs = service.list_all()
        serializer = EvenementSerializer(qs, many=True)
        return Response(serializer.data)
    # POST
    serializer = EvenementSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    service = EvenementService()
    obj = service.create(**serializer.validated_data)
    serializer = EvenementSerializer(obj)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([
    CanViewEvenement,
    CanUpdateEvenement,
    CanDeleteEvenement,
])
def evenement_detail(request, pk: int):
    """GET: détail | PUT/PATCH: modification | DELETE: suppression."""
    service = EvenementService()
    try:
        obj = service.get_or_raise(pk)
    except NotFoundError as e:
        return Response({"detail": str(e.message)}, status=status.HTTP_404_NOT_FOUND)
    if request.method == "GET":
        serializer = EvenementSerializer(obj)
        return Response(serializer.data)
    if request.method == "DELETE":
        service.delete(pk)
        return Response(status=status.HTTP_204_NO_CONTENT)
    # PUT / PATCH
    partial = request.method == "PATCH"
    serializer = EvenementSerializer(obj, data=request.data, partial=partial)
    serializer.is_valid(raise_exception=True)
    updated = service.update(pk, **serializer.validated_data)
    return Response(EvenementSerializer(updated).data)

# --- Categorie (CRUD + permissions) ---
@api_view(["GET", "POST"])
@permission_classes([
    CanViewCategorie,
    CanCreateCategorie,
])
def categorie_list(request):
    """GET: liste | POST: création."""
    if request.method == "GET":
        service = CategorieService()
        qs = service.list_all()
        serializer = CategorieSerializer(qs, many=True)
        return Response(serializer.data)
    # POST
    serializer = CategorieSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    service = CategorieService()
    obj = service.create(**serializer.validated_data)
    serializer = CategorieSerializer(obj)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([
    CanViewCategorie,
    CanUpdateCategorie,
    CanDeleteCategorie,
])
def categorie_detail(request, pk: int):
    """GET: détail | PUT/PATCH: modification | DELETE: suppression."""
    service = CategorieService()
    try:
        obj = service.get_or_raise(pk)
    except NotFoundError as e:
        return Response({"detail": str(e.message)}, status=status.HTTP_404_NOT_FOUND)
    if request.method == "GET":
        serializer = CategorieSerializer(obj)
        return Response(serializer.data)
    if request.method == "DELETE":
        service.delete(pk)
        return Response(status=status.HTTP_204_NO_CONTENT)
    # PUT / PATCH
    partial = request.method == "PATCH"
    serializer = CategorieSerializer(obj, data=request.data, partial=partial)
    serializer.is_valid(raise_exception=True)
    updated = service.update(pk, **serializer.validated_data)
    return Response(CategorieSerializer(updated).data)

# --- Tag (CRUD + permissions) ---
@api_view(["GET", "POST"])
@permission_classes([
    CanViewTag,
    CanCreateTag,
])
def tag_list(request):
    """GET: liste | POST: création."""
    if request.method == "GET":
        service = TagService()
        qs = service.list_all()
        serializer = TagSerializer(qs, many=True)
        return Response(serializer.data)
    # POST
    serializer = TagSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    service = TagService()
    obj = service.create(**serializer.validated_data)
    serializer = TagSerializer(obj)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([
    CanViewTag,
    CanUpdateTag,
    CanDeleteTag,
])
def tag_detail(request, pk: int):
    """GET: détail | PUT/PATCH: modification | DELETE: suppression."""
    service = TagService()
    try:
        obj = service.get_or_raise(pk)
    except NotFoundError as e:
        return Response({"detail": str(e.message)}, status=status.HTTP_404_NOT_FOUND)
    if request.method == "GET":
        serializer = TagSerializer(obj)
        return Response(serializer.data)
    if request.method == "DELETE":
        service.delete(pk)
        return Response(status=status.HTTP_204_NO_CONTENT)
    # PUT / PATCH
    partial = request.method == "PATCH"
    serializer = TagSerializer(obj, data=request.data, partial=partial)
    serializer.is_valid(raise_exception=True)
    updated = service.update(pk, **serializer.validated_data)
    return Response(TagSerializer(updated).data)

# --- AffectationEnseignant (CRUD + permissions) ---
@api_view(["GET", "POST"])
@permission_classes([
    CanViewAffectationEnseignant,
    CanCreateAffectationEnseignant,
])
def affectationenseignant_list(request):
    """GET: liste | POST: création."""
    if request.method == "GET":
        service = AffectationEnseignantService()
        qs = service.list_all()
        serializer = AffectationEnseignantSerializer(qs, many=True)
        return Response(serializer.data)
    # POST
    serializer = AffectationEnseignantSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    service = AffectationEnseignantService()
    obj = service.create(**serializer.validated_data)
    serializer = AffectationEnseignantSerializer(obj)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([
    CanViewAffectationEnseignant,
    CanUpdateAffectationEnseignant,
    CanDeleteAffectationEnseignant,
])
def affectationenseignant_detail(request, pk: int):
    """GET: détail | PUT/PATCH: modification | DELETE: suppression."""
    service = AffectationEnseignantService()
    try:
        obj = service.get_or_raise(pk)
    except NotFoundError as e:
        return Response({"detail": str(e.message)}, status=status.HTTP_404_NOT_FOUND)
    if request.method == "GET":
        serializer = AffectationEnseignantSerializer(obj)
        return Response(serializer.data)
    if request.method == "DELETE":
        service.delete(pk)
        return Response(status=status.HTTP_204_NO_CONTENT)
    # PUT / PATCH
    partial = request.method == "PATCH"
    serializer = AffectationEnseignantSerializer(obj, data=request.data, partial=partial)
    serializer.is_valid(raise_exception=True)
    updated = service.update(pk, **serializer.validated_data)
    return Response(AffectationEnseignantSerializer(updated).data)

# --- Ressource (CRUD + permissions) ---
@api_view(["GET", "POST"])
@permission_classes([
    CanViewRessource,
    CanCreateRessource,
])
def ressource_list(request):
    """GET: liste | POST: création."""
    if request.method == "GET":
        service = RessourceService()
        qs = service.list_all()
        serializer = RessourceSerializer(qs, many=True)
        return Response(serializer.data)
    # POST
    serializer = RessourceSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    service = RessourceService()
    obj = service.create(**serializer.validated_data)
    serializer = RessourceSerializer(obj)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([
    CanViewRessource,
    CanUpdateRessource,
    CanDeleteRessource,
])
def ressource_detail(request, pk: int):
    """GET: détail | PUT/PATCH: modification | DELETE: suppression."""
    service = RessourceService()
    try:
        obj = service.get_or_raise(pk)
    except NotFoundError as e:
        return Response({"detail": str(e.message)}, status=status.HTTP_404_NOT_FOUND)
    if request.method == "GET":
        serializer = RessourceSerializer(obj)
        return Response(serializer.data)
    if request.method == "DELETE":
        service.delete(pk)
        return Response(status=status.HTTP_204_NO_CONTENT)
    # PUT / PATCH
    partial = request.method == "PATCH"
    serializer = RessourceSerializer(obj, data=request.data, partial=partial)
    serializer.is_valid(raise_exception=True)
    updated = service.update(pk, **serializer.validated_data)
    return Response(RessourceSerializer(updated).data)

# --- ConsultationRessource (CRUD + permissions) ---
@api_view(["GET", "POST"])
@permission_classes([
    CanViewConsultationRessource,
    CanCreateConsultationRessource,
])
def consultationressource_list(request):
    """GET: liste | POST: création."""
    if request.method == "GET":
        service = ConsultationRessourceService()
        qs = service.list_all()
        serializer = ConsultationRessourceSerializer(qs, many=True)
        return Response(serializer.data)
    # POST
    serializer = ConsultationRessourceSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    service = ConsultationRessourceService()
    obj = service.create(**serializer.validated_data)
    serializer = ConsultationRessourceSerializer(obj)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([
    CanViewConsultationRessource,
    CanUpdateConsultationRessource,
    CanDeleteConsultationRessource,
])
def consultationressource_detail(request, pk: int):
    """GET: détail | PUT/PATCH: modification | DELETE: suppression."""
    service = ConsultationRessourceService()
    try:
        obj = service.get_or_raise(pk)
    except NotFoundError as e:
        return Response({"detail": str(e.message)}, status=status.HTTP_404_NOT_FOUND)
    if request.method == "GET":
        serializer = ConsultationRessourceSerializer(obj)
        return Response(serializer.data)
    if request.method == "DELETE":
        service.delete(pk)
        return Response(status=status.HTTP_204_NO_CONTENT)
    # PUT / PATCH
    partial = request.method == "PATCH"
    serializer = ConsultationRessourceSerializer(obj, data=request.data, partial=partial)
    serializer.is_valid(raise_exception=True)
    updated = service.update(pk, **serializer.validated_data)
    return Response(ConsultationRessourceSerializer(updated).data)

# --- Exemplaire (CRUD + permissions) ---
@api_view(["GET", "POST"])
@permission_classes([
    CanViewExemplaire,
    CanCreateExemplaire,
])
def exemplaire_list(request):
    """GET: liste | POST: création."""
    if request.method == "GET":
        service = ExemplaireService()
        qs = service.list_all()
        serializer = ExemplaireSerializer(qs, many=True)
        return Response(serializer.data)
    # POST
    serializer = ExemplaireSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    service = ExemplaireService()
    obj = service.create(**serializer.validated_data)
    serializer = ExemplaireSerializer(obj)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([
    CanViewExemplaire,
    CanUpdateExemplaire,
    CanDeleteExemplaire,
])
def exemplaire_detail(request, pk: int):
    """GET: détail | PUT/PATCH: modification | DELETE: suppression."""
    service = ExemplaireService()
    try:
        obj = service.get_or_raise(pk)
    except NotFoundError as e:
        return Response({"detail": str(e.message)}, status=status.HTTP_404_NOT_FOUND)
    if request.method == "GET":
        serializer = ExemplaireSerializer(obj)
        return Response(serializer.data)
    if request.method == "DELETE":
        service.delete(pk)
        return Response(status=status.HTTP_204_NO_CONTENT)
    # PUT / PATCH
    partial = request.method == "PATCH"
    serializer = ExemplaireSerializer(obj, data=request.data, partial=partial)
    serializer.is_valid(raise_exception=True)
    updated = service.update(pk, **serializer.validated_data)
    return Response(ExemplaireSerializer(updated).data)

# --- Emprunt (CRUD + permissions) ---
@api_view(["GET", "POST"])
@permission_classes([
    CanViewEmprunt,
    CanCreateEmprunt,
])
def emprunt_list(request):
    """GET: liste | POST: création."""
    if request.method == "GET":
        service = EmpruntService()
        qs = service.list_all()
        serializer = EmpruntSerializer(qs, many=True)
        return Response(serializer.data)
    # POST
    serializer = EmpruntSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    service = EmpruntService()
    obj = service.create(**serializer.validated_data)
    serializer = EmpruntSerializer(obj)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([
    CanViewEmprunt,
    CanUpdateEmprunt,
    CanDeleteEmprunt,
])
def emprunt_detail(request, pk: int):
    """GET: détail | PUT/PATCH: modification | DELETE: suppression."""
    service = EmpruntService()
    try:
        obj = service.get_or_raise(pk)
    except NotFoundError as e:
        return Response({"detail": str(e.message)}, status=status.HTTP_404_NOT_FOUND)
    if request.method == "GET":
        serializer = EmpruntSerializer(obj)
        return Response(serializer.data)
    if request.method == "DELETE":
        service.delete(pk)
        return Response(status=status.HTTP_204_NO_CONTENT)
    # PUT / PATCH
    partial = request.method == "PATCH"
    serializer = EmpruntSerializer(obj, data=request.data, partial=partial)
    serializer.is_valid(raise_exception=True)
    updated = service.update(pk, **serializer.validated_data)
    return Response(EmpruntSerializer(updated).data)

# --- Reservation (CRUD + permissions) ---
@api_view(["GET", "POST"])
@permission_classes([
    CanViewReservation,
    CanCreateReservation,
])
def reservation_list(request):
    """GET: liste | POST: création."""
    if request.method == "GET":
        service = ReservationService()
        qs = service.list_all()
        serializer = ReservationSerializer(qs, many=True)
        return Response(serializer.data)
    # POST
    serializer = ReservationSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    service = ReservationService()
    obj = service.create(**serializer.validated_data)
    serializer = ReservationSerializer(obj)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([
    CanViewReservation,
    CanUpdateReservation,
    CanDeleteReservation,
])
def reservation_detail(request, pk: int):
    """GET: détail | PUT/PATCH: modification | DELETE: suppression."""
    service = ReservationService()
    try:
        obj = service.get_or_raise(pk)
    except NotFoundError as e:
        return Response({"detail": str(e.message)}, status=status.HTTP_404_NOT_FOUND)
    if request.method == "GET":
        serializer = ReservationSerializer(obj)
        return Response(serializer.data)
    if request.method == "DELETE":
        service.delete(pk)
        return Response(status=status.HTTP_204_NO_CONTENT)
    # PUT / PATCH
    partial = request.method == "PATCH"
    serializer = ReservationSerializer(obj, data=request.data, partial=partial)
    serializer.is_valid(raise_exception=True)
    updated = service.update(pk, **serializer.validated_data)
    return Response(ReservationSerializer(updated).data)

# --- Message (CRUD + permissions) ---
@api_view(["GET", "POST"])
@permission_classes([
    CanViewMessage,
    CanCreateMessage,
])
def message_list(request):
    """GET: liste | POST: création."""
    if request.method == "GET":
        service = MessageService()
        qs = service.list_all()
        serializer = MessageSerializer(qs, many=True)
        return Response(serializer.data)
    # POST
    serializer = MessageSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    service = MessageService()
    obj = service.create(**serializer.validated_data)
    serializer = MessageSerializer(obj)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([
    CanViewMessage,
    CanUpdateMessage,
    CanDeleteMessage,
])
def message_detail(request, pk: int):
    """GET: détail | PUT/PATCH: modification | DELETE: suppression."""
    service = MessageService()
    try:
        obj = service.get_or_raise(pk)
    except NotFoundError as e:
        return Response({"detail": str(e.message)}, status=status.HTTP_404_NOT_FOUND)
    if request.method == "GET":
        serializer = MessageSerializer(obj)
        return Response(serializer.data)
    if request.method == "DELETE":
        service.delete(pk)
        return Response(status=status.HTTP_204_NO_CONTENT)
    # PUT / PATCH
    partial = request.method == "PATCH"
    serializer = MessageSerializer(obj, data=request.data, partial=partial)
    serializer.is_valid(raise_exception=True)
    updated = service.update(pk, **serializer.validated_data)
    return Response(MessageSerializer(updated).data)

# --- Forum (CRUD + permissions) ---
@api_view(["GET", "POST"])
@permission_classes([
    CanViewForum,
    CanCreateForum,
])
def forum_list(request):
    """GET: liste | POST: création."""
    if request.method == "GET":
        service = ForumService()
        qs = service.list_all()
        serializer = ForumSerializer(qs, many=True)
        return Response(serializer.data)
    # POST
    serializer = ForumSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    service = ForumService()
    obj = service.create(**serializer.validated_data)
    serializer = ForumSerializer(obj)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([
    CanViewForum,
    CanUpdateForum,
    CanDeleteForum,
])
def forum_detail(request, pk: int):
    """GET: détail | PUT/PATCH: modification | DELETE: suppression."""
    service = ForumService()
    try:
        obj = service.get_or_raise(pk)
    except NotFoundError as e:
        return Response({"detail": str(e.message)}, status=status.HTTP_404_NOT_FOUND)
    if request.method == "GET":
        serializer = ForumSerializer(obj)
        return Response(serializer.data)
    if request.method == "DELETE":
        service.delete(pk)
        return Response(status=status.HTTP_204_NO_CONTENT)
    # PUT / PATCH
    partial = request.method == "PATCH"
    serializer = ForumSerializer(obj, data=request.data, partial=partial)
    serializer.is_valid(raise_exception=True)
    updated = service.update(pk, **serializer.validated_data)
    return Response(ForumSerializer(updated).data)

# --- Sujet (CRUD + permissions) ---
@api_view(["GET", "POST"])
@permission_classes([
    CanViewSujet,
    CanCreateSujet,
])
def sujet_list(request):
    """GET: liste | POST: création."""
    if request.method == "GET":
        service = SujetService()
        qs = service.list_all()
        serializer = SujetSerializer(qs, many=True)
        return Response(serializer.data)
    # POST
    serializer = SujetSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    service = SujetService()
    obj = service.create(**serializer.validated_data)
    serializer = SujetSerializer(obj)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([
    CanViewSujet,
    CanUpdateSujet,
    CanDeleteSujet,
])
def sujet_detail(request, pk: int):
    """GET: détail | PUT/PATCH: modification | DELETE: suppression."""
    service = SujetService()
    try:
        obj = service.get_or_raise(pk)
    except NotFoundError as e:
        return Response({"detail": str(e.message)}, status=status.HTTP_404_NOT_FOUND)
    if request.method == "GET":
        serializer = SujetSerializer(obj)
        return Response(serializer.data)
    if request.method == "DELETE":
        service.delete(pk)
        return Response(status=status.HTTP_204_NO_CONTENT)
    # PUT / PATCH
    partial = request.method == "PATCH"
    serializer = SujetSerializer(obj, data=request.data, partial=partial)
    serializer.is_valid(raise_exception=True)
    updated = service.update(pk, **serializer.validated_data)
    return Response(SujetSerializer(updated).data)

# --- Reponse (CRUD + permissions) ---
@api_view(["GET", "POST"])
@permission_classes([
    CanViewReponse,
    CanCreateReponse,
])
def reponse_list(request):
    """GET: liste | POST: création."""
    if request.method == "GET":
        service = ReponseService()
        qs = service.list_all()
        serializer = ReponseSerializer(qs, many=True)
        return Response(serializer.data)
    # POST
    serializer = ReponseSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    service = ReponseService()
    obj = service.create(**serializer.validated_data)
    serializer = ReponseSerializer(obj)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([
    CanViewReponse,
    CanUpdateReponse,
    CanDeleteReponse,
])
def reponse_detail(request, pk: int):
    """GET: détail | PUT/PATCH: modification | DELETE: suppression."""
    service = ReponseService()
    try:
        obj = service.get_or_raise(pk)
    except NotFoundError as e:
        return Response({"detail": str(e.message)}, status=status.HTTP_404_NOT_FOUND)
    if request.method == "GET":
        serializer = ReponseSerializer(obj)
        return Response(serializer.data)
    if request.method == "DELETE":
        service.delete(pk)
        return Response(status=status.HTTP_204_NO_CONTENT)
    # PUT / PATCH
    partial = request.method == "PATCH"
    serializer = ReponseSerializer(obj, data=request.data, partial=partial)
    serializer.is_valid(raise_exception=True)
    updated = service.update(pk, **serializer.validated_data)
    return Response(ReponseSerializer(updated).data)

# --- ReactionReponse (CRUD + permissions) ---
@api_view(["GET", "POST"])
@permission_classes([
    CanViewReactionReponse,
    CanCreateReactionReponse,
])
def reactionreponse_list(request):
    """GET: liste | POST: création."""
    if request.method == "GET":
        service = ReactionReponseService()
        qs = service.list_all()
        serializer = ReactionReponseSerializer(qs, many=True)
        return Response(serializer.data)
    # POST
    serializer = ReactionReponseSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    service = ReactionReponseService()
    obj = service.create(**serializer.validated_data)
    serializer = ReactionReponseSerializer(obj)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([
    CanViewReactionReponse,
    CanUpdateReactionReponse,
    CanDeleteReactionReponse,
])
def reactionreponse_detail(request, pk: int):
    """GET: détail | PUT/PATCH: modification | DELETE: suppression."""
    service = ReactionReponseService()
    try:
        obj = service.get_or_raise(pk)
    except NotFoundError as e:
        return Response({"detail": str(e.message)}, status=status.HTTP_404_NOT_FOUND)
    if request.method == "GET":
        serializer = ReactionReponseSerializer(obj)
        return Response(serializer.data)
    if request.method == "DELETE":
        service.delete(pk)
        return Response(status=status.HTTP_204_NO_CONTENT)
    # PUT / PATCH
    partial = request.method == "PATCH"
    serializer = ReactionReponseSerializer(obj, data=request.data, partial=partial)
    serializer.is_valid(raise_exception=True)
    updated = service.update(pk, **serializer.validated_data)
    return Response(ReactionReponseSerializer(updated).data)

