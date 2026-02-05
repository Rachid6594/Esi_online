"""
Repository consultationressource : accès aux données (pattern Repository).
"""
from app.core.repositories.base import BaseRepository
from app.administration.models import ConsultationRessource


class ConsultationRessourceRepository(BaseRepository):
    model = ConsultationRessource

    def get_queryset(self):
        return super().get_queryset()