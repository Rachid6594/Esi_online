"""
Repository ressourcecours : accès aux données (pattern Repository).
"""
from app.core.repositories.base import BaseRepository
from app.espace_prof.models import RessourceCours


class RessourceCoursRepository(BaseRepository):
    model = RessourceCours

    def get_queryset(self):
        return super().get_queryset()