"""
Repository classe : accès aux données (pattern Repository).
"""
from app.core.repositories.base import BaseRepository
from app.administration.models import Classe


class ClasseRepository(BaseRepository):
    model = Classe

    def get_queryset(self):
        return super().get_queryset()