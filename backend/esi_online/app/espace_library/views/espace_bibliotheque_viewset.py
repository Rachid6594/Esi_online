"""
ViewSet CRUD pour espace_bibliotheque.
"""
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from app.espace_library.models import EspaceBibliotheque
from app.espace_library.serializers import EspaceBibliothequeSerializer
from app.espace_library.services.espace_bibliotheque_service import EspaceBibliothequeService
from app.espace_library.permissions.espace_bibliotheque_permissions import (
    CanViewEspaceBibliotheque,
    CanCreateEspaceBibliotheque,
    CanUpdateEspaceBibliotheque,
    CanDeleteEspaceBibliotheque,
)


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
