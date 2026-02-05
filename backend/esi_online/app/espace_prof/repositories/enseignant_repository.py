"""
Repository enseignant : accès aux données (pattern Repository).
"""
from app.core.repositories.base import BaseRepository
from app.espace_prof.models import Enseignant


class EnseignantRepository(BaseRepository):
    model = Enseignant

    def get_queryset(self):
        return super().get_queryset()