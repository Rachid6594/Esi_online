"""
Repository reservation : accès aux données (pattern Repository).
"""
from app.core.repositories.base import BaseRepository
from app.administration.models import Reservation


class ReservationRepository(BaseRepository):
    model = Reservation

    def get_queryset(self):
        return super().get_queryset()