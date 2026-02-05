"""
Repository pour l'accès aux données administration.
"""
from app.administration.models import Administration
from app.administration.interfaces.administration_repository_interface import AdministrationRepositoryInterface


class AdministrationRepository(AdministrationRepositoryInterface):
    def get_all(self):
        return Administration.objects.all()

    def get_by_id(self, pk):
        return Administration.objects.get(id=pk)

    def create(self, data):
        return Administration.objects.create(**data)

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
