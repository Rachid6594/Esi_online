"""
ViewSet CRUD pour administration.
"""
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from app.administration.models import Administration
from app.administration.serializers import AdministrationSerializer
from app.administration.services.administration_service import AdministrationService
from app.administration.permissions.administration_permissions import (
    CanViewAdministration,
    CanCreateAdministration,
    CanUpdateAdministration,
    CanDeleteAdministration,
)


class AdministrationViewSet(viewsets.ModelViewSet):
    queryset = Administration.objects.all()
    serializer_class = AdministrationSerializer

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.service = AdministrationService()

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [CanViewAdministration()]
        if self.action == "create":
            return [CanCreateAdministration()]
        if self.action in ("update", "partial_update"):
            return [CanUpdateAdministration()]
        if self.action == "destroy":
            return [CanDeleteAdministration()]
        return [IsAuthenticated()]

    def list(self, request, *args, **kwargs):
        items = self.service.get_all()
        serializer = self.get_serializer(items, many=True)
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        try:
            obj = self.service.get_by_id(kwargs["pk"])
        except Administration.DoesNotExist:
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
        except Administration.DoesNotExist:
            return Response({"detail": "Non trouvé."}, status=status.HTTP_404_NOT_FOUND)
        serializer = self.get_serializer(obj, data=request.data, partial=kwargs.get("partial", False))
        serializer.is_valid(raise_exception=True)
        obj = self.service.update(kwargs["pk"], serializer.validated_data, partial=kwargs.get("partial", False))
        return Response(self.get_serializer(obj).data)

    def destroy(self, request, *args, **kwargs):
        try:
            self.service.delete(kwargs["pk"])
        except Administration.DoesNotExist:
            return Response({"detail": "Non trouvé."}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)
