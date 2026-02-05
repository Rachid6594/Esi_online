"""
Repository sujet : accès aux données (pattern Repository).
"""
from app.core.repositories.base import BaseRepository
from app.administration.models import Sujet


class SujetRepository(BaseRepository):
    model = Sujet

    def get_queryset(self):
        return super().get_queryset()