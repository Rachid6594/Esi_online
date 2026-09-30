"""
Service TentativeQCM : logique métier.
"""
from app.espace_student.repositories.tentativeqcm_repository import TentativeQCMRepository
from app.core.exceptions import NotFoundError, ValidationError


class TentativeQCMService:
    def __init__(self):
        self.repository = TentativeQCMRepository()

    def get_by_id(self, pk: int):
        return self.repository.get_by_id(pk)

    def get_or_raise(self, pk: int):
        obj = self.repository.get_by_id(pk)
        if obj is None:
            raise NotFoundError(f"TentativeQCM avec id={pk} introuvable.")
        return obj

    def list_all(self):
        return self.repository.get_queryset()

    def list_pour_etudiant(self, etudiant):
        """Tentatives d'un seul etudiant (voir RenduTPService)."""
        return self.repository.filter(etudiant=etudiant)

    def get_pour_etudiant(self, pk: int, etudiant):
        """Tentative d'un etudiant donne, ou None (404 plutot que 403)."""
        return self.repository.filter(pk=pk, etudiant=etudiant).first()

    def create(self, **kwargs):
        return self.repository.create(**kwargs)

    def update(self, pk: int, **kwargs):
        obj = self.get_or_raise(pk)
        for key, value in kwargs.items():
            if hasattr(obj, key):
                setattr(obj, key, value)
        obj.save()
        return obj

    def delete(self, pk: int) -> bool:
        return self.repository.delete(pk)