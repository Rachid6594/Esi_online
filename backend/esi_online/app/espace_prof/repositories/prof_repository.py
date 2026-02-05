"""
Repository pour l'accès aux données prof.
"""
from app.espace_prof.models import Prof
from app.espace_prof.interfaces.prof_repository_interface import ProfRepositoryInterface


class ProfRepository(ProfRepositoryInterface):
    def get_all(self):
        return Prof.objects.all()

    def get_by_id(self, pk):
        return Prof.objects.get(id=pk)

    def create(self, data):
        return Prof.objects.create(**data)

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
