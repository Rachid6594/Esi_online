"""
Repository pour l'accès aux données espace_bibliotheque.
"""
from app.espace_library.models import EspaceBibliotheque
from app.espace_library.interfaces.espace_bibliotheque_repository_interface import EspaceBibliothequeRepositoryInterface


class EspaceBibliothequeRepository(EspaceBibliothequeRepositoryInterface):
    def get_all(self):
        return EspaceBibliotheque.objects.all()

    def get_by_id(self, pk):
        return EspaceBibliotheque.objects.get(id=pk)

    def create(self, data):
        return EspaceBibliotheque.objects.create(**data)

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
