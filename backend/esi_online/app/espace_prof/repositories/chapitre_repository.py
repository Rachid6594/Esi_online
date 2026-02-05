"""
Repository chapitre : accès aux données (pattern Repository).
"""
from app.core.repositories.base import BaseRepository
from app.espace_prof.models import Chapitre


class ChapitreRepository(BaseRepository):
    model = Chapitre

    def get_queryset(self):
        return super().get_queryset()