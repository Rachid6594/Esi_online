"""
Repository reponseetudiantqcm : accès aux données (pattern Repository).
"""
from app.core.repositories.base import BaseRepository
from app.espace_student.models import ReponseEtudiantQCM


class ReponseEtudiantQCMRepository(BaseRepository):
    model = ReponseEtudiantQCM

    def get_queryset(self):
        return super().get_queryset()