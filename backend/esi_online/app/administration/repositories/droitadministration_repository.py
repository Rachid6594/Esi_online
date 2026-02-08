"""
Repository DroitAdministration : accès aux données (pattern Repository).
"""
from app.core.repositories.base import BaseRepository
from app.administration.models import DroitAdministration


class DroitAdministrationRepository(BaseRepository):
    model = DroitAdministration

    def get_queryset(self):
        return super().get_queryset()
