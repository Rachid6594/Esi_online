"""
Repository superadmin : accès aux données (pattern Repository).
"""
from app.core.repositories.base import BaseRepository
from app.admin.models import SuperAdmin


class SuperAdminRepository(BaseRepository):
    model = SuperAdmin

    def get_queryset(self):
        return super().get_queryset()