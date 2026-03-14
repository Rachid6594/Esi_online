"""
ViewSet CRUD pour espace_bibliotheque.
"""
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action

from app.espace_library.models import (EspaceBibliotheque, Auteur, Categorie, Collection, Livre,
    RapportSoutenance, DocumentDevoir, Signalement)
from app.espace_library.serializers import ( EspaceBibliothequeSerializer, AuteurSerializer, CategorieSerializer, CollectionSerializer,
    LivreListSerializer, LivreDetailSerializer,
    RapportSoutenanceSerializer, DocumentDevoirSerializer,
    SignalementAdminSerializer)
from app.espace_library.services.espace_bibliotheque_service import EspaceBibliothequeService
from app.espace_library.permissions.espace_bibliotheque_permissions import (
    CanViewEspaceBibliotheque,
    CanCreateEspaceBibliotheque,
    CanUpdateEspaceBibliotheque,
    CanDeleteEspaceBibliotheque,
)
from app.espace_library.permissions import IsBibliothecaire


class EspaceBibliothequeViewSet(viewsets.ModelViewSet):
    queryset = EspaceBibliotheque.objects.all()
    serializer_class = EspaceBibliothequeSerializer

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.service = EspaceBibliothequeService()

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [CanViewEspaceBibliotheque()]
        if self.action == "create":
            return [CanCreateEspaceBibliotheque()]
        if self.action in ("update", "partial_update"):
            return [CanUpdateEspaceBibliotheque()]
        if self.action == "destroy":
            return [CanDeleteEspaceBibliotheque()]
        return [IsAuthenticated()]

    def list(self, request, *args, **kwargs):
        items = self.service.get_all()
        serializer = self.get_serializer(items, many=True)
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        try:
            obj = self.service.get_by_id(kwargs["pk"])
        except EspaceBibliotheque.DoesNotExist:
            return Response({"detail": "Non trouvé."}, status=status.HTTP_404_NOT_FOUND)
        serializer = self.get_serializer(obj)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        obj = self.service.create(serializer.validated_data)
        serializer = self.get_serializer(obj)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        try:
            obj = self.service.get_by_id(kwargs["pk"])
        except EspaceBibliotheque.DoesNotExist:
            return Response({"detail": "Non trouvé."}, status=status.HTTP_404_NOT_FOUND)
        serializer = self.get_serializer(obj, data=request.data, partial=kwargs.get("partial", False))
        serializer.is_valid(raise_exception=True)
        obj = self.service.update(kwargs["pk"], serializer.validated_data, partial=kwargs.get("partial", False))
        return Response(self.get_serializer(obj).data)

    def destroy(self, request, *args, **kwargs):
        try:
            self.service.delete(kwargs["pk"])
        except EspaceBibliotheque.DoesNotExist:
            return Response({"detail": "Non trouvé."}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)


class AuteurViewSet(viewsets.ModelViewSet):
    queryset = Auteur.objects.all()
    serializer_class = AuteurSerializer

    def get_permissions(self):
        return [IsBibliothecaire()]


class CategorieViewSet(viewsets.ModelViewSet):
    queryset = Categorie.objects.all()
    serializer_class = CategorieSerializer

    def get_permissions(self):
        return [IsBibliothecaire()]


class CollectionViewSet(viewsets.ModelViewSet):
    queryset = Collection.objects.all()
    serializer_class = CollectionSerializer

    def get_permissions(self):
        return [IsBibliothecaire()]

class LivreViewSet(viewsets.ModelViewSet):
    permission_classes = [IsBibliothecaire]

    def get_queryset(self):
        queryset = Livre.objects.all()
        titre = self.request.query_params.get("titre")
        if titre:
            queryset = queryset.filter(titre__icontains=titre)
        return queryset

    def get_serializer_class(self):
        if self.action == "list":
            return LivreListSerializer
        return LivreDetailSerializer

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        livre = self.get_object()
        livre.est_actif = False
        livre.save()
        return Response({"status": "livre désactivé"})

class RapportSoutenanceViewSet(viewsets.ModelViewSet):
    queryset = RapportSoutenance.objects.all()
    serializer_class = RapportSoutenanceSerializer

    def get_permissions(self):
        return [IsBibliothecaire()]

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        rapport = self.get_object()
        rapport.est_actif = False
        rapport.save()
        return Response({"status": "rapport désactivé"})


class DocumentDevoirViewSet(viewsets.ModelViewSet):
    queryset = DocumentDevoir.objects.all()
    serializer_class = DocumentDevoirSerializer

    def get_permissions(self):
        return [IsBibliothecaire()]

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        doc = self.get_object()
        doc.est_actif = False
        doc.save()
        return Response({"status": "document désactivé"})


class SignalementViewSet(viewsets.ModelViewSet):
    queryset = Signalement.objects.all()
    serializer_class = SignalementAdminSerializer

    def get_permissions(self):
        return [IsBibliothecaire()]

    def get_queryset(self):
        # Bibliothecaire voit tous les signalements
        return Signalement.objects.all()

    @action(detail=True, methods=['post'])
    def treat(self, request, pk=None):
        signalement = self.get_object()
        signalement.statut = "TRAITE"
        signalement.traite_par = request.user
        signalement.save()
        serializer = self.get_serializer(signalement)
        return Response(serializer.data) 