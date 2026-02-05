"""
Repository de base : abstraction d'accès aux données (pattern Repository).
Les services utilisent les repositories au lieu d'accéder directement aux modèles.
"""
from typing import Generic, TypeVar

from django.db.models import Model, QuerySet

ModelType = TypeVar("ModelType", bound=Model)


class BaseRepository(Generic[ModelType]):
    """Repository générique : CRUD et filtres sur un modèle Django."""

    model: type[ModelType]

    def __init__(self, model: type[ModelType] | None = None):
        self.model = model or self.model

    def get_queryset(self) -> QuerySet[ModelType]:
        return self.model.objects.all()

    def get_by_id(self, pk: int) -> ModelType | None:
        return self.get_queryset().filter(pk=pk).first()

    def get_or_raise(self, pk: int):
        obj = self.get_by_id(pk)
        if obj is None:
            raise self.model.DoesNotExist(f"{self.model.__name__} avec pk={pk} introuvable.")
        return obj

    def filter(self, **kwargs) -> QuerySet[ModelType]:
        return self.get_queryset().filter(**kwargs)

    def create(self, **kwargs) -> ModelType:
        return self.model.objects.create(**kwargs)

    def update(self, pk: int, **kwargs) -> ModelType | None:
        obj = self.get_by_id(pk)
        if obj is None:
            return None
        for key, value in kwargs.items():
            if hasattr(obj, key):
                setattr(obj, key, value)
        obj.save()
        return obj

    def delete(self, pk: int) -> bool:
        obj = self.get_by_id(pk)
        if obj is None:
            return False
        obj.delete()
        return True

    def exists(self, **kwargs) -> bool:
        return self.get_queryset().filter(**kwargs).exists()
