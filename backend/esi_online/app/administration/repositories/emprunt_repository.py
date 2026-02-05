"""
Repository emprunt : accès aux données (pattern Repository).
"""
from app.core.repositories.base import BaseRepository
from app.administration.models import Emprunt


class EmpruntRepository(BaseRepository):
    model = Emprunt

    def get_queryset(self):
        return super().get_queryset()