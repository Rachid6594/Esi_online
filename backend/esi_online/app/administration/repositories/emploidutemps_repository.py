"""
Repository emploidutemps : accès aux données (pattern Repository).
"""
from app.core.repositories.base import BaseRepository
from app.administration.models import EmploiDuTemps


class EmploiDuTempsRepository(BaseRepository):
    model = EmploiDuTemps

    def get_queryset(self):
        return super().get_queryset()