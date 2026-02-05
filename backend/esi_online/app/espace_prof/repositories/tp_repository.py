"""
Repository tp : accès aux données (pattern Repository).
"""
from app.core.repositories.base import BaseRepository
from app.espace_prof.models import TP


class TPRepository(BaseRepository):
    model = TP

    def get_queryset(self):
        return super().get_queryset()