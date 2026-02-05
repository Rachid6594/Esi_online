"""
Service Niveau : logique métier.
"""
from app.administration.repositories.niveau_repository import NiveauRepository
from app.core.exceptions import NotFoundError, ValidationError


class NiveauService:
    def __init__(self):
        self.repository = NiveauRepository()

    def get_by_id(self, pk: int):
        return self.repository.get_by_id(pk)

    def get_or_raise(self, pk: int):
        obj = self.repository.get_by_id(pk)
        if obj is None:
            raise NotFoundError(f"Niveau avec id={pk} introuvable.")
        return obj

    def list_all(self):
        return self.repository.get_queryset()

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