"""
Repository annonce : accès aux données (pattern Repository).
"""
from app.core.repositories.base import BaseRepository
from app.administration.models import Annonce


class AnnonceRepository(BaseRepository):
    model = Annonce

    def get_queryset(self):
        return super().get_queryset()