"""
Service ReponseEtudiantQCM : logique métier.
"""
from app.espace_student.repositories.reponseetudiantqcm_repository import ReponseEtudiantQCMRepository
from app.core.exceptions import NotFoundError, ValidationError


class ReponseEtudiantQCMService:
    def __init__(self):
        self.repository = ReponseEtudiantQCMRepository()

    def get_by_id(self, pk: int):
        return self.repository.get_by_id(pk)

    def get_or_raise(self, pk: int):
        obj = self.repository.get_by_id(pk)
        if obj is None:
            raise NotFoundError(f"ReponseEtudiantQCM avec id={pk} introuvable.")
        return obj

    def list_all(self):
        return self.repository.get_queryset()

    def list_pour_etudiant(self, etudiant):
        """Reponses d'un seul etudiant. Le lien passe par la tentative, qui
        porte l'etudiant ; filtrer directement sur "etudiant" n'existerait pas
        sur ce modele."""
        return self.repository.filter(tentative__etudiant=etudiant)

    def get_pour_etudiant(self, pk: int, etudiant):
        """Reponse d'un etudiant donne, ou None (404 plutot que 403)."""
        return self.repository.filter(pk=pk, tentative__etudiant=etudiant).first()

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