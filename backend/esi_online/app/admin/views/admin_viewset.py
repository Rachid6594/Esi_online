"""
ViewSet CRUD pour admin.
"""
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from app.admin.models import Admin
from app.admin.serializers import AdminSerializer
from app.admin.services.admin_service import AdminService
from app.admin.permissions.admin_permissions import (
    CanViewAdmin,
    CanCreateAdmin,
    CanUpdateAdmin,
    CanDeleteAdmin,
)


class AdminViewSet(viewsets.ModelViewSet):
    queryset = Admin.objects.all()
    serializer_class = AdminSerializer

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.service = AdminService()

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [CanViewAdmin()]
        if self.action == "create":
            return [CanCreateAdmin()]
        if self.action in ("update", "partial_update"):
            return [CanUpdateAdmin()]
        if self.action == "destroy":
            return [CanDeleteAdmin()]
        return [IsAuthenticated()]

    def list(self, request, *args, **kwargs):
        items = self.service.get_all()
        serializer = self.get_serializer(items, many=True)
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        try:
            obj = self.service.get_by_id(kwargs["pk"])
        except Admin.DoesNotExist:
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
        except Admin.DoesNotExist:
            return Response({"detail": "Non trouvé."}, status=status.HTTP_404_NOT_FOUND)
        serializer = self.get_serializer(obj, data=request.data, partial=kwargs.get("partial", False))
        serializer.is_valid(raise_exception=True)
        obj = self.service.update(kwargs["pk"], serializer.validated_data, partial=kwargs.get("partial", False))
        return Response(self.get_serializer(obj).data)

    def destroy(self, request, *args, **kwargs):
        try:
            self.service.delete(kwargs["pk"])
        except Admin.DoesNotExist:
            return Response({"detail": "Non trouvé."}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)
