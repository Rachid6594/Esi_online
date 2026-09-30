"""
Service RenduTP : logique métier.
"""
from app.espace_student.repositories.rendutp_repository import RenduTPRepository
from app.core.exceptions import NotFoundError, ValidationError


class RenduTPService:
    def __init__(self):
        self.repository = RenduTPRepository()

    def get_by_id(self, pk: int):
        return self.repository.get_by_id(pk)

    def get_or_raise(self, pk: int):
        obj = self.repository.get_by_id(pk)
        if obj is None:
            raise NotFoundError(f"RenduTP avec id={pk} introuvable.")
        return obj

    def list_all(self):
        return self.repository.get_queryset()

    def list_pour_etudiant(self, etudiant):
        """Rendus d'un seul etudiant. Sans ce filtre, list_all() renvoyait
        les rendus de toute l'ecole a quiconque avait la permission de lire."""
        return self.repository.filter(etudiant=etudiant)

    def get_pour_etudiant(self, pk: int, etudiant):
        """Rendu d'un etudiant donne, ou None. On repond 404 et non 403 pour ne
        pas reveler qu'un rendu portant cet id existe pour quelqu'un d'autre."""
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