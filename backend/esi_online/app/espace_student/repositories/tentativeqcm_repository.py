"""
Repository tentativeqcm : accès aux données (pattern Repository).
"""
from app.core.repositories.base import BaseRepository
from app.espace_student.models import TentativeQCM


class TentativeQCMRepository(BaseRepository):
    model = TentativeQCM

    def get_queryset(self):
        return super().get_queryset()