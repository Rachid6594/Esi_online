"""
Repository cours : accès aux données (pattern Repository).
"""
from app.core.repositories.base import BaseRepository
from app.espace_prof.models import Cours


class CoursRepository(BaseRepository):
    model = Cours

    def get_queryset(self):
        return super().get_queryset()