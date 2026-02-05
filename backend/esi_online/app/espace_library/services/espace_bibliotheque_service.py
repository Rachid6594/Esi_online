"""
Service métier pour espace_bibliotheque.
"""
from app.espace_library.models import EspaceBibliotheque
from app.espace_library.repositories.espace_bibliotheque_repository import EspaceBibliothequeRepository


class EspaceBibliothequeService:
    def __init__(self):
        self.repository = EspaceBibliothequeRepository()

    def get_all(self):
        return self.repository.get_all()

    def get_by_id(self, pk):
        return self.repository.get_by_id(pk)

    def create(self, data):
        return self.repository.create(data)

    def update(self, pk, data, partial=False):
        return self.repository.update(pk, data, partial)

    def delete(self, pk):
        return self.repository.delete(pk)
