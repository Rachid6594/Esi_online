"""
Repository categorie : accès aux données (pattern Repository).
"""
from app.core.repositories.base import BaseRepository
from app.administration.models import Categorie


class CategorieRepository(BaseRepository):
    model = Categorie

    def get_queryset(self):
        return super().get_queryset()