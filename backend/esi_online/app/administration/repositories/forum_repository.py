"""
Repository forum : accès aux données (pattern Repository).
"""
from app.core.repositories.base import BaseRepository
from app.administration.models import Forum


class ForumRepository(BaseRepository):
    model = Forum

    def get_queryset(self):
        return super().get_queryset()