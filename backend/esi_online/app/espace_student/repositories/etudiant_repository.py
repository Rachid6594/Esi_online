"""
Repository etudiant : accès aux données (pattern Repository).
"""
from app.core.repositories.base import BaseRepository
from app.espace_student.models import Etudiant


class EtudiantRepository(BaseRepository):
    model = Etudiant

    def get_queryset(self):
        return super().get_queryset()