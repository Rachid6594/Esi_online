"""
ViewSet CRUD pour prof.
"""
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from app.espace_prof.models import Prof
from app.espace_prof.serializers import ProfSerializer
from app.espace_prof.services.prof_service import ProfService
from app.espace_prof.permissions.prof_permissions import (
    CanViewProf,
    CanCreateProf,
    CanUpdateProf,
    CanDeleteProf,
)


class ProfViewSet(viewsets.ModelViewSet):
    queryset = Prof.objects.all()
    serializer_class = ProfSerializer

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.service = ProfService()

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [CanViewProf()]
        if self.action == "create":
            return [CanCreateProf()]
        if self.action in ("update", "partial_update"):
            return [CanUpdateProf()]
        if self.action == "destroy":
            return [CanDeleteProf()]
        return [IsAuthenticated()]

    def list(self, request, *args, **kwargs):
        items = self.service.get_all()
        serializer = self.get_serializer(items, many=True)
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        try:
            obj = self.service.get_by_id(kwargs["pk"])
        except Prof.DoesNotExist:
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
        except Prof.DoesNotExist:
            return Response({"detail": "Non trouvé."}, status=status.HTTP_404_NOT_FOUND)
        serializer = self.get_serializer(obj, data=request.data, partial=kwargs.get("partial", False))
        serializer.is_valid(raise_exception=True)
        obj = self.service.update(kwargs["pk"], serializer.validated_data, partial=kwargs.get("partial", False))
        return Response(self.get_serializer(obj).data)

    def destroy(self, request, *args, **kwargs):
        try:
            self.service.delete(kwargs["pk"])
        except Prof.DoesNotExist:
            return Response({"detail": "Non trouvé."}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)
