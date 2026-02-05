"""
Repository pour l'accès aux données eleve.
"""
from app.espace_student.models import Eleve
from app.espace_student.interfaces.eleve_repository_interface import EleveRepositoryInterface


class EleveRepository(EleveRepositoryInterface):
    def get_all(self):
        return Eleve.objects.all()

    def get_by_id(self, pk):
        return Eleve.objects.get(id=pk)

    def create(self, data):
        return Eleve.objects.create(**data)

    def update(self, pk, data, partial=False):
        obj = self.get_by_id(pk)
        for field, value in data.items():
            if hasattr(obj, field):
                setattr(obj, field, value)
        obj.save()
        return obj

    def delete(self, pk):
        obj = self.get_by_id(pk)
        obj.delete()
        return True
