"""
Repository qcm : accès aux données (pattern Repository).
"""
from app.core.repositories.base import BaseRepository
from app.espace_prof.models import QCM


class QCMRepository(BaseRepository):
    model = QCM

    def get_queryset(self):
        return super().get_queryset()