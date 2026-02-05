"""
Repository user : accès aux données (pattern Repository).
"""
from app.core.repositories.base import BaseRepository
from app.admin.models import User


class UserRepository(BaseRepository):
    model = User

    def get_queryset(self):
        return super().get_queryset()