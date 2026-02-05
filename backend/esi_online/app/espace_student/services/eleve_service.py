"""
Service métier pour eleve.
"""
from app.espace_student.models import Eleve
from app.espace_student.repositories.eleve_repository import EleveRepository


class EleveService:
    def __init__(self):
        self.repository = EleveRepository()

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
